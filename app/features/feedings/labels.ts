import type { FeedingKind } from '@/types/domain';

/** Source-of-truth ordering used by the feeding type tile grid. */
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

const ICONS: Record<
  FeedingKind,
  | 'arrow-left-bold-outline'
  | 'arrow-right-bold-outline'
  | 'baby-bottle-outline'
  | 'cup-outline'
  | 'food-apple-outline'
> = {
  breast_left: 'arrow-left-bold-outline',
  breast_right: 'arrow-right-bold-outline',
  bottle_breast_milk: 'baby-bottle-outline',
  bottle_formula: 'cup-outline',
  solid: 'food-apple-outline',
};

/** i18next key for a feeding kind. UI does the t() call. */
export const feedingKindKey = (kind: FeedingKind) => KEYS[kind];
export const feedingKindIcon = (kind: FeedingKind) => ICONS[kind];
