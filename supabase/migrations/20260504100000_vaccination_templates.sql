-- =====================================================================
-- Seed vaccination_templates from the Ukrainian National Preventive
-- Vaccination Calendar effective 2026-01-01.
--
-- Source: Ministry of Health of Ukraine (Наказ МОЗ № 595, latest
-- редакція 2025-2026), summarised by the Public Health Center:
--   https://moz.gov.ua/uk/kalendar-profilaktichnih-scheplen
--   https://phc.org.ua/news/kraschiy-zakhist-dityam-zruchnishe-batkam-yak-zminivsya-kalendar-profilaktichnikh-scheplen-z
--
-- The 2026 update unifies the primary course of HepB / DTaP / IPV / Hib
-- on a single 2-4-6-18-month schedule, moves BCG to within 24 hours of
-- birth (Mantoux-free window extended to 7 months), and switches polio
-- entirely to IPV. The seed covers the 0–24 month window the app shows.
--
-- Codes are stable identifiers; the app resolves localized vaccine
-- group names via i18n (`vaccinations.group.<group_code>`). The English
-- `name` column is kept as a fallback for the dashboard.
--
-- RLS is not enabled here to match the dev-mode state of
-- milestone_templates. Re-enable with a `templates_read` policy when
-- preparing for production.
-- =====================================================================

create table public.vaccination_templates (
  id                       uuid primary key default gen_random_uuid(),
  code                     text unique not null,
  name                     text not null,
  group_code               text not null,
  dose_number              int not null,
  expected_age_min_months  int not null,
  expected_age_max_months  int not null
);

-- Match the dev-mode state of the other domain tables. Re-enable with a
-- `templates_read` policy when preparing for production.
alter table public.vaccination_templates disable row level security;

insert into public.vaccination_templates
  (code, group_code, dose_number, name, expected_age_min_months, expected_age_max_months)
values
  ('bcg_birth',  'bcg',  1, 'BCG (tuberculosis)',           0,  7),

  ('hepb_2m',    'hepb', 1, 'Hepatitis B (dose 1)',         2,  4),
  ('hepb_4m',    'hepb', 2, 'Hepatitis B (dose 2)',         4,  6),
  ('hepb_6m',    'hepb', 3, 'Hepatitis B (dose 3)',         6,  12),
  ('hepb_18m',   'hepb', 4, 'Hepatitis B (booster)',        18, 24),

  ('dtap_2m',    'dtap', 1, 'DTaP (dose 1)',                2,  4),
  ('dtap_4m',    'dtap', 2, 'DTaP (dose 2)',                4,  6),
  ('dtap_6m',    'dtap', 3, 'DTaP (dose 3)',                6,  12),
  ('dtap_18m',   'dtap', 4, 'DTaP (booster)',               18, 24),

  ('ipv_2m',     'ipv',  1, 'Polio IPV (dose 1)',           2,  4),
  ('ipv_4m',     'ipv',  2, 'Polio IPV (dose 2)',           4,  6),
  ('ipv_6m',     'ipv',  3, 'Polio IPV (dose 3)',           6,  12),
  ('ipv_18m',    'ipv',  4, 'Polio IPV (booster)',          18, 24),

  ('hib_2m',     'hib',  1, 'Hib (dose 1)',                 2,  4),
  ('hib_4m',     'hib',  2, 'Hib (dose 2)',                 4,  6),
  ('hib_6m',     'hib',  3, 'Hib (dose 3)',                 6,  12),
  ('hib_18m',    'hib',  4, 'Hib (booster)',                18, 24),

  ('mmr_12m',    'mmr',  1, 'MMR (Measles, Mumps, Rubella)', 12, 18)
on conflict (code) do nothing;
