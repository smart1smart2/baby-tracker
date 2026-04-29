import { format, isSameDay, parseISO, subDays } from 'date-fns';

export type DailyBucket = {
  date: Date;
  /** ISO yyyy-MM-dd day key, useful as React key. */
  key: string;
  value: number;
};

/**
 * Group rows into N consecutive day buckets ending today.
 *
 * @param rows arbitrary records
 * @param dateAt ISO timestamp accessor — which field decides the day for a row
 * @param days how many days to include (e.g. 7 → today + 6 days back)
 * @param add reducer adding a row's contribution to the day's running total
 *            (e.g. () => 1 for counts, or (acc, row) => acc + minutesSlept(row))
 */
export function aggregateByDay<T>(
  rows: T[],
  dateAt: (row: T) => string,
  days: number,
  add: (acc: number, row: T) => number,
): DailyBucket[] {
  const today = new Date();
  const buckets: DailyBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    buckets.push({
      date,
      key: format(date, 'yyyy-MM-dd'),
      value: 0,
    });
  }

  rows.forEach((row) => {
    const rowDate = parseISO(dateAt(row));
    const bucket = buckets.find((b) => isSameDay(b.date, rowDate));
    if (bucket) bucket.value = add(bucket.value, row);
  });

  return buckets;
}
