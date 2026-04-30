-- =====================================================================
-- delete_my_account()
-- =====================================================================
-- Self-service account deletion. We can't grant the auth admin role to
-- the client, so the deletion runs as a SECURITY DEFINER function that
-- removes the auth.users row for the calling user. The cascading FK on
-- profiles + on every domain table that references children carries the
-- rest of the data with it.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
