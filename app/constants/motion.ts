/**
 * Motion tokens — duration and easing for animations across the app.
 */
export const duration = {
  instant: 0,
  fast: 120,
  base: 200,
  slow: 320,
  slower: 500,
} as const;

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  linear: 'linear',
} as const;

export type Duration = keyof typeof duration;
