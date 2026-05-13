import { addDays, addMonths, addYears, format } from 'date-fns';

import { formatAge } from '@/lib/age';

// Stub `t`: capture the call shape so we can assert without bringing i18next.
function makeT(): {
  t: (key: string, opts?: Record<string, unknown>) => string;
  calls: { key: string; opts?: Record<string, unknown> }[];
} {
  const calls: { key: string; opts?: Record<string, unknown> }[] = [];
  const t = (key: string, opts?: Record<string, unknown>) => {
    calls.push({ key, opts });
    if (opts && typeof opts.count === 'number') return `${opts.count} ${key}`;
    return key;
  };
  return { t, calls };
}

const isoOf = (d: Date) => format(d, 'yyyy-MM-dd');

describe('formatAge', () => {
  test('flags future birthdays as not-born-yet', () => {
    const { t, calls } = makeT();
    formatAge(isoOf(addDays(new Date(), 5)), t as never);
    expect(calls[0].key).toBe('age.notBornYet');
  });

  test('reports days for the first two weeks', () => {
    const { t, calls } = makeT();
    formatAge(isoOf(addDays(new Date(), -5)), t as never);
    expect(calls[0]).toEqual({ key: 'age.days', opts: { count: 5 } });
  });

  test('switches to weeks between 2 and 12 weeks', () => {
    const { t, calls } = makeT();
    formatAge(isoOf(addDays(new Date(), -28)), t as never); // 4 weeks
    expect(calls[0].key).toBe('age.weeks');
    expect((calls[0].opts as { count: number }).count).toBe(4);
  });

  test('switches to months between 12 weeks and 24 months', () => {
    const { t, calls } = makeT();
    formatAge(isoOf(addMonths(new Date(), -10)), t as never);
    expect(calls[0].key).toBe('age.months');
  });

  test('emits years (and remaining months) past 24 months', () => {
    const { t, calls } = makeT();
    formatAge(isoOf(addMonths(addYears(new Date(), -3), -2)), t as never);
    const keys = calls.map((c) => c.key);
    expect(keys).toContain('age.years');
    expect(keys).toContain('age.months');
  });
});
