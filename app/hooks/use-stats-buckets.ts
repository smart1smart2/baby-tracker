import { useMemo } from 'react';
import { differenceInMinutes, format, parseISO } from 'date-fns';

import { useDiapersInRange } from '@/features/diapers/queries';
import { useFeedingsInRange } from '@/features/feedings/queries';
import { useSleepsInRange } from '@/features/sleeps/queries';
import { useLastDaysRange } from '@/hooks/use-last-days-range';
import { aggregateByDay, type DailyBucket } from '@/lib/aggregate';
import type { Sleep } from '@/types/domain';

/** A sleep is "night" when it started between 19:00 and 06:59 inclusive. */
const isNightSleep = (s: Sleep) => {
  const h = parseISO(s.started_at).getHours();
  return h >= 19 || h < 7;
};

const sleepHours = (s: Sleep): number => {
  const end = s.ended_at ? parseISO(s.ended_at) : new Date();
  return Math.max(differenceInMinutes(end, parseISO(s.started_at)), 0) / 60;
};

export type StatsBuckets = {
  feedings: DailyBucket[];
  sleepHours: DailyBucket[];
  diapers: DailyBucket[];
  sleepSplit: { night: number; day: number };
  sleepsCount: number;
  diapersCount: number;
  /** Rounded average diapers per active (logged) day; 0 when no data. */
  diaperAvg: number;
  /** Distinct days with at least one diaper entry — gates "below norm" hints. */
  diaperActiveDays: number;
};

/**
 * Pulls the last `days` of feedings/sleeps/diapers for the active child and
 * aggregates them into per-day buckets plus the rollups the Stats screen
 * shows under each chart (sleep day/night split, diaper active-day average).
 */
export function useStatsBuckets(childId: string | null, days: number): StatsBuckets {
  const { from, to } = useLastDaysRange(days);

  const { data: feedings = [] } = useFeedingsInRange(childId, from, to);
  const { data: sleeps = [] } = useSleepsInRange(childId, from, to);
  const { data: diapers = [] } = useDiapersInRange(childId, from, to);

  const feedingsBuckets = useMemo(
    () => aggregateByDay(feedings, (f) => f.started_at, days, (acc) => acc + 1),
    [feedings, days],
  );

  const sleepHoursBuckets = useMemo(
    () =>
      aggregateByDay(
        sleeps,
        (s) => s.started_at,
        days,
        (acc, s) => acc + sleepHours(s),
      ),
    [sleeps, days],
  );

  const diapersBuckets = useMemo(
    () => aggregateByDay(diapers, (d) => d.occurred_at, days, (acc) => acc + 1),
    [diapers, days],
  );

  const sleepSplit = useMemo(() => {
    let night = 0;
    let day = 0;
    sleeps.forEach((s) => {
      const h = sleepHours(s);
      if (isNightSleep(s)) night += h;
      else day += h;
    });
    return { night, day };
  }, [sleeps]);

  const diaperActiveDays = useMemo(
    () => new Set(diapers.map((d) => format(parseISO(d.occurred_at), 'yyyy-MM-dd'))).size,
    [diapers],
  );
  const diaperAvg = diaperActiveDays > 0 ? Math.round(diapers.length / diaperActiveDays) : 0;

  return {
    feedings: feedingsBuckets,
    sleepHours: sleepHoursBuckets,
    diapers: diapersBuckets,
    sleepSplit,
    sleepsCount: sleeps.length,
    diapersCount: diapers.length,
    diaperAvg,
    diaperActiveDays,
  };
}
