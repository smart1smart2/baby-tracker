-- =====================================================================
-- Auto-add the creator as the owner caregiver of every new child.
-- =====================================================================
-- Without this trigger the client has to do two inserts (children, then
-- caregivers), and the caregivers row needs a self-referential RLS bypass
-- to land. Letting Postgres handle the second insert as a SECURITY DEFINER
-- trigger keeps the client mutation atomic and removes the race / RLS
-- gymnastics.

create or replace function public.add_child_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.caregivers (child_id, profile_id, role)
    values (new.id, auth.uid(), 'owner')
    on conflict (child_id, profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_child_created on public.children;
create trigger on_child_created
  after insert on public.children
  for each row execute function public.add_child_owner();
