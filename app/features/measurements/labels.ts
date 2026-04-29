import { categoryColors, palette } from '@/constants';
import type { MeasurementKind } from '@/types/domain';

export const MEASUREMENT_KINDS: readonly MeasurementKind[] = [
  'weight',
  'height',
  'head_circumference',
] as const;

const KEYS: Record<MeasurementKind, string> = {
  weight: 'measurements.kinds.weight',
  height: 'measurements.kinds.height',
  head_circumference: 'measurements.kinds.headCircumference',
};

const ICONS: Record<MeasurementKind, 'scale-bathroom' | 'human-male-height' | 'head-outline'> = {
  weight: 'scale-bathroom',
  height: 'human-male-height',
  head_circumference: 'head-outline',
};

const DEFAULT_UNITS: Record<MeasurementKind, string> = {
  weight: 'kg',
  height: 'cm',
  head_circumference: 'cm',
};

const TINTS: Record<MeasurementKind, string> = {
  weight: palette.tertiary[400],
  height: categoryColors.growth,
  head_circumference: palette.secondary[400],
};

export const measurementKindKey = (kind: MeasurementKind) => KEYS[kind];
export const measurementKindIcon = (kind: MeasurementKind) => ICONS[kind];
export const measurementKindTint = (kind: MeasurementKind) => TINTS[kind];
export const defaultUnit = (kind: MeasurementKind) => DEFAULT_UNITS[kind];
