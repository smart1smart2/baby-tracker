/**
 * `2026-05-05` style date-only key, used as a Postgres `date` column value
 * (e.g. `milestones.achieved_at`, `vaccinations.administered_at`) and as a
 * React Query cache key suffix. Slicing the ISO string keeps the result
 * timezone-stable: it's always the UTC calendar date, matching how the
 * Postgres `date` type is stored.
 */
export function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}
