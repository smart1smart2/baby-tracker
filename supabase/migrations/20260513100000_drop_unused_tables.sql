-- Drop tables that have no UI and were never shipped: photos and reminders.
-- The reminder_kind enum is also removed as nothing else depends on it.

drop table if exists public.photos cascade;
drop table if exists public.reminders cascade;
drop type  if exists public.reminder_kind cascade;
