import { addMonths, format } from 'date-fns';

import {
  ageMonthsAt,
  classifyValue,
  whoBands,
} from '@/features/measurements/who';

const isoOf = (d: Date) => format(d, 'yyyy-MM-dd');

describe('whoBands', () => {
  test('returns bands at month-zero exactly', () => {
    const b = whoBands('male', 'weight', 0);
    expect(b).not.toBeNull();
    expect(b!.p3).toBeLessThan(b!.p50);
    expect(b!.p50).toBeLessThan(b!.p97);
  });

  test('interpolates linearly between adjacent months', () => {
    const lower = whoBands('male', 'weight', 6)!;
    const upper = whoBands('male', 'weight', 7)!;
    const mid = whoBands('male', 'weight', 6.5)!;
    expect(mid.p50).toBeCloseTo((lower.p50 + upper.p50) / 2, 3);
  });

  test('returns null past 24 months', () => {
    expect(whoBands('male', 'weight', 30)).toBeNull();
  });

  test('boys and girls produce different P50 weights', () => {
    expect(whoBands('male', 'weight', 12)!.p50).not.toBe(
      whoBands('female', 'weight', 12)!.p50,
    );
  });
});

describe('classifyValue', () => {
  const bands = { p3: 6, p15: 7, p50: 8, p85: 9, p97: 10 };

  test.each([
    [5.9, 'below_p3'],
    [6.5, 'p3_p15'],
    [8, 'p15_p85'],
    [9, 'p15_p85'],
    [9.5, 'p85_p97'],
    [10.5, 'above_p97'],
  ])('value %p falls in band %p', (value, expected) => {
    expect(classifyValue(value, bands)).toBe(expected);
  });
});

describe('ageMonthsAt', () => {
  test('returns whole months between DOB and timestamp', () => {
    const dob = new Date('2026-01-01');
    const at = addMonths(dob, 6);
    expect(ageMonthsAt(isoOf(dob), at.toISOString())).toBe(6);
  });

  test('clamps to zero for future DOBs', () => {
    const dob = new Date('2099-01-01');
    expect(ageMonthsAt(isoOf(dob), new Date().toISOString())).toBe(0);
  });
});
