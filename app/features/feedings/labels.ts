import type { FeedingKind } from '@/types/domain';

/** Source-of-truth ordering used by the feeding type segmented control. */
export const FEEDING_KINDS: readonly FeedingKind[] = [
  'breast_left',
  'breast_right',
  'bottle_breast_milk',
  'bottle_formula',
  'solid',
] as const;

const KEYS: Record<FeedingKind, string> = {
  breast_left: 'feedings.kinds.breastLeft',
  breast_right: 'feedings.kinds.breastRight',
  bottle_breast_milk: 'feedings.kinds.bottleBreastMilk',
  bottle_formula: 'feedings.kinds.bottleFormula',
  solid: 'feedings.kinds.solid',
};

/** i18next key for a feeding kind. UI does the t() call. */
export const feedingKindKey = (kind: FeedingKind) => KEYS[kind];
