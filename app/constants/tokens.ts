/**
 * Layout and sizing tokens — single source of truth for non-color design values.
 * Colors live in `constants/colors.ts`, typography in `constants/typography.ts`.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.xl,
  sectionGap: spacing.lg,
  touchableMinHeight: 48,
  maxContentWidth: 560,
  fieldHeight: 56,
} as const;

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  brand: 72,
} as const;

export const opacity = {
  full: 1,
  muted: 0.72,
  subtle: 0.56,
  faint: 0.38,
  disabled: 0.32,
} as const;

export type Spacing = keyof typeof spacing;
export type Radii = keyof typeof radii;
