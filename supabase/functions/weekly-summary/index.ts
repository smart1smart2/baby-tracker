// Supabase Edge Function: weekly-summary
//
// Returns the per-day aggregated counts for the active child over the last
// `days` days (default 7) — the same shape the Stats screen builds locally,
// but computed server-side so multiple devices can share one source of
// truth and the PDF export can be generated without re-walking the
// dataset on each phone.
//
// Auth: the caller passes their Supabase session JWT in the
// `Authorization: Bearer <token>` header. The function spins up a
// per-request Supabase client with that token attached, so RLS sees the
// user normally — a parent can only summarise their own child.
//
// Invocation:
//   POST /functions/v1/weekly-summary
//   { "child_id": "uuid", "days": 7 }
//
// Deploy: `supabase functions deploy weekly-summary --no-verify-jwt=false`

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Bucket = { date: string; value: number };

type Body = {
  child_id?: string;
  days?: number;
};

const MAX_DAYS = 90;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function bucketKeys(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function emptyBuckets(days: number): Bucket[] {
  return bucketKeys(days).map((date) => ({ date, value: 0 }));
}

function tally<T extends { [k: string]: unknown }>(
  rows: T[],
  dateField: keyof T,
  add: (acc: number, row: T) => number,
  days: number,
): Bucket[] {
  const buckets = emptyBuckets(days);
  const byDate = new Map(buckets.map((b) => [b.date, b]));
  for (const row of rows) {
    const ts = row[dateField] as string | undefined;
    if (!ts) continue;
    const dateKey = ts.slice(0, 10);
    const bucket = byDate.get(dateKey);
    if (bucket) bucket.value = add(bucket.value, row);
  }
  return buckets;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return json(401, { error: 'missing_auth' });

  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const childId = body.child_id;
  if (!childId || typeof childId !== 'string') {
    return json(400, { error: 'child_id_required' });
  }

  const days = Math.min(Math.max(Number(body.days ?? 7), 1), MAX_DAYS);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) return json(500, { error: 'misconfigured' });

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const sinceIso = since.toISOString();

  const [feedings, sleeps, diapers] = await Promise.all([
    client
      .from('feedings')
      .select('started_at')
      .eq('child_id', childId)
      .gte('started_at', sinceIso),
    client
      .from('sleeps')
      .select('started_at, ended_at')
      .eq('child_id', childId)
      .gte('started_at', sinceIso),
    client
      .from('diapers')
      .select('occurred_at')
      .eq('child_id', childId)
      .gte('occurred_at', sinceIso),
  ]);

  if (feedings.error || sleeps.error || diapers.error) {
    return json(500, {
      error: 'query_failed',
      detail:
        feedings.error?.message ?? sleeps.error?.message ?? diapers.error?.message,
    });
  }

  const feedingBuckets = tally(
    feedings.data ?? [],
    'started_at',
    (acc) => acc + 1,
    days,
  );

  const diaperBuckets = tally(
    diapers.data ?? [],
    'occurred_at',
    (acc) => acc + 1,
    days,
  );

  const sleepHourBuckets = tally(
    sleeps.data ?? [],
    'started_at',
    (acc, row) => {
      const start = new Date(row.started_at as string).getTime();
      const end = row.ended_at
        ? new Date(row.ended_at as string).getTime()
        : Date.now();
      const hours = Math.max(end - start, 0) / (1000 * 60 * 60);
      return acc + hours;
    },
    days,
  );

  return json(200, {
    child_id: childId,
    days,
    feedings: feedingBuckets,
    sleep_hours: sleepHourBuckets,
    diapers: diaperBuckets,
  });
});
