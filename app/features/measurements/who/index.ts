import { differenceInMonths, parseISO } from 'date-fns';

import {
  WHO_STANDARDS,
  type WhoMetric,
  type WhoRow,
  type WhoSex,
} from './standards';
import type { GrowthMeasurement, MeasurementKind, Sex } from '@/types/domain';

const KIND_TO_METRIC: Record<MeasurementKind, WhoMetric> = {
  weight: 'weight',
  height: 'height',
  head_circumference: 'head_circumference',
};

/**
 * The WHO standards split on biological sex. The app's `unspecified` value
 * gets the boys' table — both because the boys' percentile bands are
 * marginally wider (so a real outlier still flags) and because the WHO
 * publication doesn't ship a unisex chart.
 */
function whoSex(sex: Sex | string | null | undefined): WhoSex {
  return sex === 'female' ? 'female' : 'male';
}

export type Bands = {
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
};

const linterp = (a: number, b: number, t: number) => a + (b - a) * t;

function lookup(rows: readonly WhoRow[], ageMonths: number): Bands | null {
  if (ageMonths < rows[0][0] || ageMonths > rows[rows.length - 1][0]) return null;
  const upperIdx = rows.findIndex((r) => r[0] >= ageMonths);
  if (upperIdx === -1) return null;
  const upper = rows[upperIdx];
  if (upper[0] === ageMonths || upperIdx === 0) {
    return { p3: upper[1], p15: upper[2], p50: upper[3], p85: upper[4], p97: upper[5] };
  }
  const lower = rows[upperIdx - 1];
  const t = (ageMonths - lower[0]) / (upper[0] - lower[0]);
  return {
    p3: linterp(lower[1], upper[1], t),
    p15: linterp(lower[2], upper[2], t),
    p50: linterp(lower[3], upper[3], t),
    p85: linterp(lower[4], upper[4], t),
    p97: linterp(lower[5], upper[5], t),
  };
}

/** Returns null when the kid's age is outside the 0–24 month standards window. */
export function whoBands(
  sex: Sex | string | null | undefined,
  kind: MeasurementKind,
  ageMonths: number,
): Bands | null {
  return lookup(WHO_STANDARDS[whoSex(sex)][KIND_TO_METRIC[kind]], ageMonths);
}

export function ageMonthsAt(dobIso: string, atIso: string): number {
  return Math.max(differenceInMonths(parseISO(atIso), parseISO(dobIso)), 0);
}

export type PercentileBand = 'below_p3' | 'p3_p15' | 'p15_p85' | 'p85_p97' | 'above_p97';

export function classifyValue(value: number, bands: Bands): PercentileBand {
  if (value < bands.p3) return 'below_p3';
  if (value < bands.p15) return 'p3_p15';
  if (value <= bands.p85) return 'p15_p85';
  if (value <= bands.p97) return 'p85_p97';
  return 'above_p97';
}

/**
 * Convenience: given a measurement and the child's DOB+sex, returns both the
 * reference bands at that measurement's age and the band the value falls in.
 * Returns null when the measurement is outside the WHO 0–24 month range.
 */
export function classifyMeasurement(
  measurement: GrowthMeasurement,
  dobIso: string,
  sex: Sex | string | null | undefined,
): { bands: Bands; band: PercentileBand } | null {
  const months = ageMonthsAt(dobIso, measurement.measured_at);
  const bands = whoBands(sex, measurement.kind, months);
  if (!bands) return null;
  return { bands, band: classifyValue(measurement.value, bands) };
}
