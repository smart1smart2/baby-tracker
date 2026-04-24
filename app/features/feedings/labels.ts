import type { FeedingKind } from '@/types/domain';

const LABELS: Record<FeedingKind, string> = {
  breast_left: 'Груди (ліва)',
  breast_right: 'Груди (права)',
  bottle_breast_milk: 'Пляшечка (молоко)',
  bottle_formula: 'Пляшечка (суміш)',
  solid: 'Прикорм',
};

export const feedingKindLabel = (kind: FeedingKind) => LABELS[kind];
