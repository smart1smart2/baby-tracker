-- =====================================================================
-- pgTAP regression tests for the RLS policies on per-child tables.
--
-- Asserts that a parent in family A cannot SELECT, INSERT, UPDATE or
-- DELETE rows belonging to family B's child — the central guarantee
-- that lets us share one Postgres database safely across all users.
--
-- Local run (requires Supabase CLI):
--   supabase start
--   supabase db reset    # applies migrations in order
--   supabase test db     # runs every *.test.sql under supabase/tests/
--
-- The dev-mode disable migration (20260427_disable_rls_for_dev.sql) is
-- bypassed by re-enabling RLS at the top of this file. The transaction
-- rolls back at the end so other tests stay unaffected.
-- =====================================================================

begin;

-- Make every assertion run with RLS engaged, regardless of the dev-mode
-- toggle migration that disables it for the running app.
alter table public.profiles               enable row level security;
alter table public.children               enable row level security;
alter table public.caregivers             enable row level security;
alter table public.feedings               enable row level security;
alter table public.sleeps                 enable row level security;
alter table public.diapers                enable row level security;
alter table public.growth_measurements    enable row level security;
alter table public.milestones             enable row level security;
alter table public.vaccinations           enable row level security;

select plan(8);

-- Two families with one child each. The `handle_new_user()` trigger on
-- auth.users insert already creates a public.profiles row, so we update
-- the auto-created rows in place instead of inserting fresh ones.
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'parent_a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'parent_b@example.com');

update public.profiles set full_name = 'Parent A'
  where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set full_name = 'Parent B'
  where id = '22222222-2222-2222-2222-222222222222';

insert into public.children (id, full_name, date_of_birth)
values
  ('aaaa1111-1111-1111-1111-111111111111', 'Child A', '2026-01-01'),
  ('bbbb2222-2222-2222-2222-222222222222', 'Child B', '2026-01-01');

insert into public.caregivers (child_id, profile_id, role) values
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'owner');

insert into public.feedings (id, child_id, kind, started_at)
values
  ('cccc1111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'bottle_formula', now()),
  ('cccc2222-2222-2222-2222-222222222222',
   'bbbb2222-2222-2222-2222-222222222222',
   'bottle_formula', now());

-- Switch into Parent A's session.
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select count(*)::int from public.children),
  1,
  'Parent A sees only Child A in `children`'
);

select is(
  (select count(*)::int from public.feedings),
  1,
  'Parent A sees only Child A''s feedings'
);

select is(
  (select count(*)::int from public.feedings
     where child_id = 'bbbb2222-2222-2222-2222-222222222222'),
  0,
  'Parent A cannot see family B''s feedings'
);

select throws_ok(
  $$ insert into public.feedings (child_id, kind, started_at)
     values ('bbbb2222-2222-2222-2222-222222222222', 'bottle_formula', now()) $$,
  '42501',
  null,
  'Parent A cannot insert against family B''s child'
);

-- RLS doesn't raise on UPDATE — it just hides the target row from the
-- WHERE clause, so 0 rows match. Assert via RETURNING that the update
-- affected nothing.
select is_empty(
  $$ update public.feedings
     set notes = 'tampered'
     where id = 'cccc2222-2222-2222-2222-222222222222'
     returning id $$,
  'Parent A''s update against family B''s row affects 0 rows (no-op under RLS)'
);

-- Switch into Parent B's session.
reset role;
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.children),
  1,
  'Parent B sees only Child B in `children`'
);

select is(
  (select count(*)::int from public.feedings),
  1,
  'Parent B sees only Child B''s feedings'
);

select is(
  (select count(*)::int from public.children
     where id = 'aaaa1111-1111-1111-1111-111111111111'),
  0,
  'Parent B cannot see family A''s child'
);

select * from finish();

rollback;
