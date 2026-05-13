// Edge Function: ask-assistant
//
// RAG pipeline:
//   1. Embed user prompt via Supabase AI (gte-small, 384 dims) — free
//   2. Semantic search over articles via pgvector cosine distance
//   3. Build context from top-3 articles
//   4. Call Groq (Llama 3.3 70B) for a grounded answer — free tier
//
// Falls back to full-text ILIKE search when embeddings are not yet
// computed (i.e., right after seeding before embed-articles runs).
//
// POST /functions/v1/ask-assistant
// { "prompt": "...", "child_age_months": 6 }
//
// Deploy: supabase functions deploy ask-assistant --no-verify-jwt=false

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

type ArticleSource = { id: string; title: string; category: string };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return json(401, { error: 'missing_auth' });

  let body: { prompt?: string; child_age_months?: number | null } = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) return json(400, { error: 'prompt_required' });

  const childAgeMonths = typeof body.child_age_months === 'number' ? body.child_age_months : null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!;
  const groqKey    = Deno.env.get('GROQ_API_KEY');

  if (!groqKey) return json(500, { error: 'groq_key_not_configured' });

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });

  // --- Step 1: semantic search via Supabase AI embeddings ---
  let articles: { id: string; title: string; body: string; category: string }[] = [];

  try {
    // @ts-ignore — Supabase.ai injected by edge runtime
    const session = new Supabase.ai.Session('gte-small');
    const output = await session.run(prompt, { mean_pool: true, normalize: true });
    const embedding = Array.from(output as Float32Array);

    const { data } = await client.rpc('match_articles', {
      query_embedding: embedding,
      match_count: 3,
      p_age_months: childAgeMonths,
    });
    articles = (data ?? []) as typeof articles;
  } catch {
    // Embeddings not yet computed — fall through to text fallback.
  }

  // --- Step 2: text search fallback ---
  if (articles.length === 0) {
    const keyword = prompt.split(/\s+/).slice(0, 4).join(' ');
    const { data } = await client
      .from('articles')
      .select('id, title, body, category')
      .or(`title.ilike.%${keyword}%,body.ilike.%${keyword}%`)
      .limit(3);
    articles = (data ?? []) as typeof articles;
  }

  // --- Step 3: build context ---
  const contextBlock = articles.length > 0
    ? articles.map((a) => `## ${a.title}\n\n${a.body}`).join('\n\n---\n\n')
    : null;

  const promptLang = /[а-яёіїєґ]/i.test(prompt) ? 'uk' : 'en';

  const systemMessage = [
    'Ти корисний помічник для батьків немовлят. Відповідай стисло, практично і тепло.',
    childAgeMonths !== null ? `Дитина батьків: ${childAgeMonths} міс.` : null,
    contextBlock
      ? `Використовуй такі матеріали як контекст (не цитуй їх дослівно):\n\n${contextBlock}`
      : 'Надавай відповідь зі своїх загальних знань.',
    "Якщо питання не стосується здоров'я, розвитку або виховання дитини — ввічливо поясни, що ти спеціалізуєшся лише на цих темах.",
    promptLang === 'uk'
      ? 'МОВА ВІДПОВІДІ: виключно українська. Жодних слів зі словацької, чеської, польської, російської чи будь-якої іншої мови. Якщо не знаєш українського слова — опиши його українськими словами.'
      : 'LANGUAGE: English only. No words from any other language.',
  ].filter(Boolean).join('\n\n');

  // --- Step 4: call Groq (OpenAI-compatible API, free tier) ---
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user',   content: promptLang === 'uk' ? `${prompt}\n\n[Відповідай лише українською мовою]` : prompt },
      ],
      max_tokens: 600,
    }),
  });

  if (!groqRes.ok) {
    const detail = await groqRes.text();
    return json(502, { error: 'groq_failed', detail });
  }

  const groqData = await groqRes.json();
  const answer: string = groqData.choices?.[0]?.message?.content ?? '';

  const sources: ArticleSource[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
  }));

  return json(200, { answer, sources });
});
