import { addDays, format } from 'date-fns';

import { aggregateByDay } from '@/lib/aggregate';

const at = (d: Date) => d.toISOString();

describe('aggregateByDay', () => {
  test('produces N consecutive day buckets ending today', () => {
    const buckets = aggregateByDay([], () => '', 7, () => 1);
    expect(buckets).toHaveLength(7);
    expect(buckets[0].key < buckets[6].key).toBe(true);
    expect(buckets[6].key).toBe(format(new Date(), 'yyyy-MM-dd'));
  });

  test('counts rows in each bucket via the reducer', () => {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const rows = [{ at: at(today) }, { at: at(today) }, { at: at(yesterday) }];
    const buckets = aggregateByDay(rows, (r) => r.at, 3, (acc) => acc + 1);
    expect(buckets[2].value).toBe(2); // today
    expect(buckets[1].value).toBe(1); // yesterday
    expect(buckets[0].value).toBe(0); // 2 days ago
  });

  test('sums weighted values via the reducer', () => {
    const today = new Date();
    const rows = [
      { at: at(today), n: 30 },
      { at: at(today), n: 15 },
    ];
    const buckets = aggregateByDay(rows, (r) => r.at, 1, (acc, r) => acc + r.n);
    expect(buckets[0].value).toBe(45);
  });

  test('drops rows that fall outside the window', () => {
    const wayBack = addDays(new Date(), -30);
    const buckets = aggregateByDay(
      [{ at: at(wayBack) }],
      (r) => r.at,
      7,
      (acc) => acc + 1,
    );
    expect(buckets.every((b) => b.value === 0)).toBe(true);
  });
});
