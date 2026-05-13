---
name: Thesis project state
description: BabyJourney clone — stack, MVP scope, what was built, what was dropped, next steps
type: project
---

React Native + Expo SDK 52, Supabase (PostgreSQL + RLS + Realtime + Edge Functions), react-query, react-native-paper, expo-router, i18next (uk+en), Sentry, Zustand.

**MVP completed (May 2026):**
- Auth: email/password + Google OAuth, profile edit, password change, delete-account RPC
- Multi-child + multi-caregiver (owner/co_parent/caregiver/pediatrician roles), child avatars in Storage
- Feeding tracker: breast L/R, bottle, solid; active-timer card
- Sleep tracker: active timer, day/night split stat
- Diaper tracker: wet/dirty/mixed/dry, health-norm indicator
- Growth measurements: weight/height/head circumference + WHO P3–P97 percentile charts
- Milestones: CDC-seeded templates by age band, mark achieved, due-now banner
- Vaccinations: full calendar by age slot, mark administered, due-now banner
- Stats screen: 7-day bar charts (feedings, sleep hours, diapers), sleep-pattern chart, growth charts
- PDF export: full 7-day report shared via system share sheet
- Supabase Realtime: cross-device sync for all per-child tables
- Edge Function `weekly-summary`: server-side aggregation, respects RLS
- Design system: tokens, brand-gradient / white-with-violet-tint surfaces, dark/light/system theme

**Dropped (not built, DB schema exists):**
- Photo journal (table `photos` in schema, no UI screen)
- Reminders / push notifications (`reminders` table + `reminder_kind` enum, no UI)
- Analytics time-range toggle (today / week / month) — only 7-day rolling

**Planned additions (Ivan's request, post-MVP):**
- Content feed (articles, videos, offers — Instagram-style)
- AI-personalized content (per pregnancy week + free-form user prompt → RAG)
- Mobile security hardening: App Integrity API (Android) or freeRASP

Why: thesis practicum requires demonstrating advanced technical features (DB/Security/AI) beyond basic CRUD.
How to apply: next tasks will add at least one of the three pillars above; prioritize whichever can be demo-ready fastest.
