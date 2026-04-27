-- =====================================================================
-- Disable RLS during development.
-- =====================================================================
-- Supabase JWT/refresh behaviour is currently flaky in this environment
-- (refresh returns access tokens with expires_at already in the past),
-- which causes auth.uid() to come through as NULL even though a session
-- exists on the client. That breaks every existing RLS policy.
--
-- For thesis demo purposes, RLS is disabled on all domain tables so the
-- app can be exercised end-to-end. Re-enable before any real production
-- use.

alter table public.profiles               disable row level security;
alter table public.children               disable row level security;
alter table public.caregivers             disable row level security;
alter table public.feedings               disable row level security;
alter table public.sleeps                 disable row level security;
alter table public.diapers                disable row level security;
alter table public.growth_measurements    disable row level security;
alter table public.milestone_templates    disable row level security;
alter table public.milestones             disable row level security;
alter table public.photos                 disable row level security;
alter table public.reminders              disable row level security;
alter table public.vaccinations           disable row level security;
