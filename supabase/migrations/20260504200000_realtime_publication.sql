-- =====================================================================
-- Add per-child domain tables to the `supabase_realtime` publication so
-- the React app can subscribe to changes and keep multiple devices in
-- sync. Templates and `caregivers` are intentionally left out — they
-- change rarely and aren't user-initiated from a second device.
-- =====================================================================

alter publication supabase_realtime add table public.feedings;
alter publication supabase_realtime add table public.sleeps;
alter publication supabase_realtime add table public.diapers;
alter publication supabase_realtime add table public.growth_measurements;
alter publication supabase_realtime add table public.milestones;
alter publication supabase_realtime add table public.vaccinations;
alter publication supabase_realtime add table public.children;
