-- =====================================================================
-- Initial schema: core domain for a baby health tracker
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type caregiver_role as enum ('owner', 'co_parent', 'caregiver', 'pediatrician');

create type feeding_kind as enum ('breast_left', 'breast_right', 'bottle_breast_milk', 'bottle_formula', 'solid');

create type diaper_kind as enum ('wet', 'dirty', 'mixed', 'dry');

create type measurement_kind as enum ('weight', 'height', 'head_circumference');

create type reminder_kind as enum ('feeding', 'sleep', 'medicine', 'vaccination', 'custom');

-- ---------------------------------------------------------------------
-- Profiles — one row per auth user
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  locale        text default 'uk',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Children
-- ---------------------------------------------------------------------
create table public.children (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  date_of_birth date not null,
  sex           text check (sex in ('male', 'female', 'unspecified')) default 'unspecified',
  avatar_url    text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Caregivers — M:N between profiles and children, with roles
-- ---------------------------------------------------------------------
create table public.caregivers (
  child_id      uuid not null references public.children(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  role          caregiver_role not null default 'co_parent',
  created_at    timestamptz not null default now(),
  primary key (child_id, profile_id)
);

create index caregivers_profile_idx on public.caregivers(profile_id);

create or replace function public.is_caregiver(p_child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.caregivers
    where child_id = p_child and profile_id = auth.uid()
  );
$$;

create or replace function public.can_edit_child(p_child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.caregivers
    where child_id = p_child
      and profile_id = auth.uid()
      and role <> 'pediatrician'
  );
$$;

-- ---------------------------------------------------------------------
-- Tracking events
-- ---------------------------------------------------------------------
create table public.feedings (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  kind              feeding_kind not null,
  started_at        timestamptz not null,
  ended_at          timestamptz,
  amount_ml         numeric(6,1),
  solid_food        text,
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index feedings_child_started_idx on public.feedings(child_id, started_at desc);

create table public.sleeps (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  started_at        timestamptz not null,
  ended_at          timestamptz,
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index sleeps_child_started_idx on public.sleeps(child_id, started_at desc);

create table public.diapers (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  kind              diaper_kind not null,
  occurred_at       timestamptz not null default now(),
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index diapers_child_occurred_idx on public.diapers(child_id, occurred_at desc);

-- ---------------------------------------------------------------------
-- Growth measurements
-- ---------------------------------------------------------------------
create table public.growth_measurements (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  kind              measurement_kind not null,
  value             numeric(7,2) not null,
  unit              text not null,
  measured_at       timestamptz not null default now(),
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index growth_child_measured_idx on public.growth_measurements(child_id, kind, measured_at desc);

-- ---------------------------------------------------------------------
-- Milestones
-- ---------------------------------------------------------------------
create table public.milestone_templates (
  id                uuid primary key default gen_random_uuid(),
  code              text unique not null,
  title             text not null,
  description       text,
  category          text not null,
  expected_age_min_months  int not null,
  expected_age_max_months  int not null
);

create table public.milestones (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  template_id       uuid references public.milestone_templates(id),
  custom_title      text,
  achieved_at       date,
  notes             text,
  photo_url         text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  check (template_id is not null or custom_title is not null)
);
create index milestones_child_idx on public.milestones(child_id);

-- ---------------------------------------------------------------------
-- Photos
-- ---------------------------------------------------------------------
create table public.photos (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  storage_path      text not null,
  caption           text,
  taken_at          timestamptz not null default now(),
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index photos_child_taken_idx on public.photos(child_id, taken_at desc);

-- ---------------------------------------------------------------------
-- Reminders
-- ---------------------------------------------------------------------
create table public.reminders (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  kind              reminder_kind not null,
  title             text not null,
  notes             text,
  due_at            timestamptz not null,
  recurrence        text,
  is_done           boolean not null default false,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index reminders_child_due_idx on public.reminders(child_id, due_at);

-- ---------------------------------------------------------------------
-- Vaccinations
-- ---------------------------------------------------------------------
create table public.vaccinations (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  vaccine_code      text not null,
  vaccine_name      text not null,
  scheduled_for     date,
  administered_at   date,
  dose_number       int,
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index vaccinations_child_idx on public.vaccinations(child_id);

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger children_updated_at before update on public.children
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles              enable row level security;
alter table public.children              enable row level security;
alter table public.caregivers            enable row level security;
alter table public.feedings              enable row level security;
alter table public.sleeps                enable row level security;
alter table public.diapers               enable row level security;
alter table public.growth_measurements   enable row level security;
alter table public.milestone_templates   enable row level security;
alter table public.milestones            enable row level security;
alter table public.photos                enable row level security;
alter table public.reminders             enable row level security;
alter table public.vaccinations          enable row level security;

create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid());

create policy "children_caregiver_select" on public.children
  for select using (public.is_caregiver(id));
create policy "children_authenticated_insert" on public.children
  for insert with check (auth.uid() is not null);
create policy "children_editor_update" on public.children
  for update using (public.can_edit_child(id));
create policy "children_owner_delete" on public.children
  for delete using (
    exists (
      select 1 from public.caregivers
      where child_id = children.id
        and profile_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "caregivers_self_select" on public.caregivers
  for select using (
    profile_id = auth.uid() or public.is_caregiver(child_id)
  );
create policy "caregivers_owner_manage" on public.caregivers
  for all using (
    exists (
      select 1 from public.caregivers c
      where c.child_id = caregivers.child_id
        and c.profile_id = auth.uid()
        and c.role = 'owner'
    )
  ) with check (
    profile_id = auth.uid()
    or exists (
      select 1 from public.caregivers c
      where c.child_id = caregivers.child_id
        and c.profile_id = auth.uid()
        and c.role = 'owner'
    )
  );

-- feedings / sleeps / diapers / growth / milestones / photos / reminders / vaccinations
create policy "feedings_select" on public.feedings for select using (public.is_caregiver(child_id));
create policy "feedings_insert" on public.feedings for insert with check (public.can_edit_child(child_id));
create policy "feedings_update" on public.feedings for update using (public.can_edit_child(child_id));
create policy "feedings_delete" on public.feedings for delete using (public.can_edit_child(child_id));

create policy "sleeps_select" on public.sleeps for select using (public.is_caregiver(child_id));
create policy "sleeps_insert" on public.sleeps for insert with check (public.can_edit_child(child_id));
create policy "sleeps_update" on public.sleeps for update using (public.can_edit_child(child_id));
create policy "sleeps_delete" on public.sleeps for delete using (public.can_edit_child(child_id));

create policy "diapers_select" on public.diapers for select using (public.is_caregiver(child_id));
create policy "diapers_insert" on public.diapers for insert with check (public.can_edit_child(child_id));
create policy "diapers_update" on public.diapers for update using (public.can_edit_child(child_id));
create policy "diapers_delete" on public.diapers for delete using (public.can_edit_child(child_id));

create policy "growth_select" on public.growth_measurements for select using (public.is_caregiver(child_id));
create policy "growth_insert" on public.growth_measurements for insert with check (public.can_edit_child(child_id));
create policy "growth_update" on public.growth_measurements for update using (public.can_edit_child(child_id));
create policy "growth_delete" on public.growth_measurements for delete using (public.can_edit_child(child_id));

create policy "templates_read" on public.milestone_templates for select using (auth.uid() is not null);

create policy "milestones_select" on public.milestones for select using (public.is_caregiver(child_id));
create policy "milestones_insert" on public.milestones for insert with check (public.can_edit_child(child_id));
create policy "milestones_update" on public.milestones for update using (public.can_edit_child(child_id));
create policy "milestones_delete" on public.milestones for delete using (public.can_edit_child(child_id));

create policy "photos_select" on public.photos for select using (public.is_caregiver(child_id));
create policy "photos_insert" on public.photos for insert with check (public.can_edit_child(child_id));
create policy "photos_update" on public.photos for update using (public.can_edit_child(child_id));
create policy "photos_delete" on public.photos for delete using (public.can_edit_child(child_id));

create policy "reminders_select" on public.reminders for select using (public.is_caregiver(child_id));
create policy "reminders_insert" on public.reminders for insert with check (public.can_edit_child(child_id));
create policy "reminders_update" on public.reminders for update using (public.can_edit_child(child_id));
create policy "reminders_delete" on public.reminders for delete using (public.can_edit_child(child_id));

create policy "vaccinations_select" on public.vaccinations for select using (public.is_caregiver(child_id));
create policy "vaccinations_insert" on public.vaccinations for insert with check (public.can_edit_child(child_id));
create policy "vaccinations_update" on public.vaccinations for update using (public.can_edit_child(child_id));
create policy "vaccinations_delete" on public.vaccinations for delete using (public.can_edit_child(child_id));
