import { palette } from '@/constants';

const GROUP_TINTS: Record<string, string> = {
  bcg: palette.accentMint,
  hepb: palette.accentSky,
  dtap: palette.accentBlush,
  ipv: palette.accentSunny,
  hib: palette.accentLavender,
  mmr: palette.accentPeach,
};

export function vaccineGroupTint(group: string): string {
  return GROUP_TINTS[group] ?? palette.accentSky;
}

export function vaccineGroupKey(group: string): string {
  return `vaccinations.group.${group}`;
}

/**
 * Standard age slots in the Ukrainian schedule. Templates bucket into the
 * slot whose `month` equals their `expected_age_min_months`. The "0" slot
 * collects vaccines given at birth (BCG today; HepB-0 if it's added later).
 */
export const VACC_AGE_SLOTS = [
  { id: 'birth', month: 0 },
  { id: 'm2', month: 2 },
  { id: 'm4', month: 4 },
  { id: 'm6', month: 6 },
  { id: 'm12', month: 12 },
  { id: 'm18', month: 18 },
] as const;

export type VaccAgeSlot = (typeof VACC_AGE_SLOTS)[number];

export function ageSlotKey(slot: VaccAgeSlot): string {
  return `vaccinations.slot.${slot.id}`;
}

export function slotForMonth(month: number): VaccAgeSlot {
  return (
    [...VACC_AGE_SLOTS].reverse().find((s) => month >= s.month) ?? VACC_AGE_SLOTS[0]
  );
}
