import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { palette } from '@/constants';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type MilestoneCategory = 'motor' | 'language' | 'social' | 'cognitive';

const FALLBACK_CATEGORY: MilestoneCategory = 'motor';

export function normalizeCategory(value: string | null | undefined): MilestoneCategory {
  if (value === 'language' || value === 'social' || value === 'cognitive' || value === 'motor') {
    return value;
  }
  return FALLBACK_CATEGORY;
}

export function categoryIcon(category: MilestoneCategory): IconName {
  switch (category) {
    case 'motor':
      return 'run';
    case 'language':
      return 'chat-outline';
    case 'social':
      return 'account-heart-outline';
    case 'cognitive':
      return 'brain';
  }
}

export function categoryTint(category: MilestoneCategory): string {
  switch (category) {
    case 'motor':
      return palette.accentPeach;
    case 'language':
      return palette.accentSky;
    case 'social':
      return palette.accentBlush;
    case 'cognitive':
      return palette.accentLavender;
  }
}

export function categoryKey(category: MilestoneCategory): string {
  return `milestones.category.${category}`;
}

/**
 * i18n key for a template's localized title/description, looked up by the
 * stable `code` stored in the database row.
 */
export function templateKey(code: string, field: 'title' | 'description'): string {
  return `milestones.tpl.${code}.${field}`;
}

/**
 * Buckets templates into the labelled age bands shown on the screen.
 * Boundaries are inclusive on the lower bound, exclusive on the upper.
 */
export const AGE_BANDS = [
  { id: 'by_2m', minMonths: 0, maxMonths: 2 },
  { id: 'by_4m', minMonths: 2, maxMonths: 4 },
  { id: 'by_6m', minMonths: 4, maxMonths: 6 },
  { id: 'by_9m', minMonths: 6, maxMonths: 9 },
  { id: 'by_12m', minMonths: 9, maxMonths: 12 },
  { id: 'by_15m', minMonths: 12, maxMonths: 15 },
  { id: 'by_18m', minMonths: 15, maxMonths: 18 },
  { id: 'by_24m', minMonths: 18, maxMonths: 24 },
] as const;

export type AgeBand = (typeof AGE_BANDS)[number];

export function ageBandKey(band: AgeBand): string {
  return `milestones.band.${band.id}`;
}

export function bandForMonths(min: number): AgeBand {
  return (
    AGE_BANDS.find((b) => min >= b.minMonths && min < b.maxMonths) ??
    AGE_BANDS[AGE_BANDS.length - 1]
  );
}
