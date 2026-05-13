// Edge Function: ask-assistant
//
// RAG pipeline:
//   1. Embed user prompt via Supabase AI (gte-small, 384 dims)
//   2. Semantic search over articles via pgvector cosine distance
//   3. Build context from top-3 articles
//   4. Call Claude to produce a grounded, parent-friendly answer
//
// Falls back to full-text ILIKE search when embeddings are not yet
// computed (i.e., right after seeding before embed-articles runs).
//
// Auth: caller passes Supabase session JWT; RLS ensures only
// authenticated users can read articles and the child record.
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

  const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
  const anonKey      = Deno.env.get('SUPABASE_ANON_KEY')!;
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!anthropicKey) return json(500, { error: 'anthropic_key_not_configured' });

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });

  // --- Step 1: semantic search ---
  let articles: { id: string; title: string; body: string; category: string }[] = [];

  try {
    // @ts-ignore — Supabase.ai injected by edge runtime
    const session = new Supabase.ai.Session('gte-small');
    const output = await session.run(prompt, { mean_pool: true, normalize: true });
    const embedding = Array.from(output.data as Float32Array);

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

  // --- Step 3: build context for Claude ---
  const contextBlock =
    articles.length > 0
      ? articles.map((a) => `## ${a.title}\n\n${a.body}`).join('\n\n---\n\n')
      : null;

  const childCtx =
    childAgeMonths !== null
      ? `Дитина батьків: ${childAgeMonths} міс.`
      : null;

  const system = [
    'Ти корисний помічник для батьків немовлят. Відповідай стисло, практично і тепло.',
    childCtx,
    contextBlock
      ? `Використовуй такі матеріали як контекст (не цитуй їх дослівно):\n\n${contextBlock}`
      : 'Надавай відповідь зі своїх загальних знань.',
    'Якщо питання не стосується здоров\'я, розвитку або виховання дитини — ввічливо поясни, що ти спеціалізуєшся лише на цих темах.',
    'Відповідай тією ж мовою, що й запит (українська або англійська).',
  ]
    .filter(Boolean)
    .join('\n\n');

  // --- Step 4: call Claude ---
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!claudeRes.ok) {
    const detail = await claudeRes.text();
    return json(502, { error: 'claude_failed', detail });
  }

  const claudeData = await claudeRes.json();
  const answer: string = claudeData.content?.[0]?.text ?? '';

  const sources: ArticleSource[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
  }));

  return json(200, { answer, sources });
});
