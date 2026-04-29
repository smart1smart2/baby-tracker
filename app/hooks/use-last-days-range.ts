import { useMemo } from 'react';
import { subDays } from 'date-fns';

/**
 * Returns a stable [from, to] window covering the last `days` days, ending
 * today (inclusive). The dates are memoised once per mount so React Query
 * keys derived from them stay stable across renders.
 */
export function useLastDaysRange(days: number) {
  const today = useMemo(() => new Date(), []);
  const from = useMemo(() => subDays(today, days - 1), [today, days]);
  return { from, to: today };
}
