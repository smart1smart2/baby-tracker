-- =====================================================================
-- Storage bucket for child avatar photos
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'child-avatars',
  'child-avatars',
  true,
  5 * 1024 * 1024, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Anyone authenticated can upload / replace / remove an avatar.
-- Write paths follow the convention `<child_id>/avatar.<ext>`; RLS on
-- public.children already blocks creating a child the caller can't access.
create policy "child_avatars_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'child-avatars');

create policy "child_avatars_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'child-avatars')
  with check (bucket_id = 'child-avatars');

create policy "child_avatars_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'child-avatars');

-- Public reads keep avatar URLs usable in shared contexts (PDF exports,
-- future caregiver invites without per-request signed URLs).
create policy "child_avatars_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'child-avatars');
