import {
  AGE_BANDS,
  bandForMonths,
  normalizeCategory,
} from '@/features/milestones/labels';

describe('normalizeCategory', () => {
  test.each(['motor', 'language', 'social', 'cognitive'] as const)(
    'returns %s unchanged',
    (cat) => {
      expect(normalizeCategory(cat)).toBe(cat);
    },
  );

  test('falls back to motor for unknown / null inputs', () => {
    expect(normalizeCategory(null)).toBe('motor');
    expect(normalizeCategory(undefined)).toBe('motor');
    expect(normalizeCategory('made-up')).toBe('motor');
  });
});

describe('bandForMonths', () => {
  test('first band picks up the 0-month case', () => {
    expect(bandForMonths(0).id).toBe('by_2m');
  });

  test('boundaries are inclusive on the lower bound', () => {
    // expected_age_min_months == 6 → must land in by_9m (6..9 exclusive)
    expect(bandForMonths(6).id).toBe('by_9m');
  });

  test('snaps anything past 24 months to the last band', () => {
    expect(bandForMonths(48).id).toBe(AGE_BANDS[AGE_BANDS.length - 1].id);
  });

  test('every month in [0, 24) lands in some band', () => {
    for (let m = 0; m < 24; m++) {
      const band = bandForMonths(m);
      expect(m).toBeGreaterThanOrEqual(band.minMonths);
      expect(m).toBeLessThan(band.maxMonths);
    }
  });
});
