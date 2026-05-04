-- =====================================================================
-- Match the dev-mode state of the other domain tables: RLS off so the
-- supabase-js client can read the schedule. The previous migration that
-- created `vaccination_templates` left RLS at the Supabase default
-- (enabled), which silently returned 0 rows for every authenticated
-- read because no policy was attached.
--
-- Production prep: re-enable with a `templates_read` policy that allows
-- any authenticated user to SELECT (mirroring milestone_templates).
-- =====================================================================

alter table public.vaccination_templates disable row level security;
