// Edge Function: embed-articles
//
// One-time (or on-demand) job that generates gte-small embeddings for
// every article whose embedding column is still NULL. Call it once
// after seeding articles:
//
//   curl -X POST https://<project>.supabase.co/functions/v1/embed-articles \
//     -H "Authorization: Bearer <service_role_key>"
//
// Deploy: supabase functions deploy embed-articles --no-verify-jwt=false

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const client = createClient(supabaseUrl, serviceKey);

  const { data: articles, error } = await client
    .from('articles')
    .select('id, title, body')
    .is('embedding', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!articles?.length) {
    return new Response(JSON.stringify({ processed: 0, message: 'all articles already embedded' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // @ts-ignore — Supabase.ai is injected by the edge runtime
  const session = new Supabase.ai.Session('gte-small');
  let processed = 0;

  for (const article of articles) {
    const text = `${article.title}\n\n${article.body}`;
    const output = await session.run(text, { mean_pool: true, normalize: true });
    const embedding = Array.from(output.data as Float32Array);
    await client.from('articles').update({ embedding }).eq('id', article.id);
    processed++;
  }

  return new Response(JSON.stringify({ processed }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
