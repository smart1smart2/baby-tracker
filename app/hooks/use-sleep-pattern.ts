import { useMemo } from 'react';
import { addDays, format, parseISO, startOfDay } from 'date-fns';

import { useSleepsInRange } from '@/features/sleeps/queries';
import { useLastDaysRange } from '@/hooks/use-last-days-range';
import type { Sleep } from '@/types/domain';

/** A single block within one day, hours expressed as floats in [0, 24]. */
export type SleepBlock = { startHour: number; endHour: number };

export type SleepPatternDay = {
  /** ISO day key (yyyy-MM-dd). */
  key: string;
  /** Calendar date for axis labelling. */
  date: Date;
  blocks: SleepBlock[];
};

const HOURS_IN_DAY = 24;
const MS_IN_HOUR = 60 * 60 * 1000;

function splitSleepAtMidnight(
  sleep: Sleep,
  windowStart: Date,
  windowEnd: Date,
): { dayKey: string; block: SleepBlock }[] {
  const start = parseISO(sleep.started_at);
  const end = sleep.ended_at ? parseISO(sleep.ended_at) : new Date();

  // Clip the sleep to the visible window so a sleep that started weeks ago
  // and only finished today still produces just one block.
  const clipStart = start < windowStart ? windowStart : start;
  const clipEnd = end > windowEnd ? windowEnd : end;
  if (clipEnd <= clipStart) return [];

  const out: { dayKey: string; block: SleepBlock }[] = [];
  let cursor = clipStart;
  while (cursor < clipEnd) {
    const dayStart = startOfDay(cursor);
    const nextDayStart = addDays(dayStart, 1);
    const segmentEnd = clipEnd < nextDayStart ? clipEnd : nextDayStart;
    out.push({
      dayKey: format(dayStart, 'yyyy-MM-dd'),
      block: {
        startHour: (cursor.getTime() - dayStart.getTime()) / MS_IN_HOUR,
        endHour: (segmentEnd.getTime() - dayStart.getTime()) / MS_IN_HOUR,
      },
    });
    cursor = segmentEnd;
  }
  return out;
}

/**
 * Buckets the last `days` days of sleep entries for the active child into a
 * per-day list of intra-day blocks suitable for a 24-hour pattern chart.
 * Sleeps that span midnight are split into two adjacent blocks; an
 * unfinished sleep is rendered up to the current moment.
 */
export function useSleepPattern(childId: string | null, days: number): SleepPatternDay[] {
  const { from, to } = useLastDaysRange(days);
  const { data: sleeps = [] } = useSleepsInRange(childId, from, to);

  return useMemo(() => {
    const today = startOfDay(new Date());
    const buckets: SleepPatternDay[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      buckets.push({ key: format(date, 'yyyy-MM-dd'), date, blocks: [] });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));

    const windowStart = buckets[0].date;
    const windowEnd = addDays(today, 1);

    for (const sleep of sleeps) {
      for (const { dayKey, block } of splitSleepAtMidnight(sleep, windowStart, windowEnd)) {
        const bucket = byKey.get(dayKey);
        if (bucket) bucket.blocks.push(block);
      }
    }
    return buckets;
  }, [sleeps, days]);
}

export const SLEEP_PATTERN_HOURS = HOURS_IN_DAY;
