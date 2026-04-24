/**
 * Brand palette for Baby Tracker.
 * Bold violet-driven palette inspired by modern fitness / wellness apps:
 * vivid primary accent on warm off-white, with pastel category tints.
 */

export const palette = {
  // Brand — vivid violet
  primary: {
    50: '#F3F1FF',
    100: '#E7E2FF',
    200: '#D4CEFF',
    300: '#B3A6FB',
    400: '#957FF8',
    500: '#7B66F6', // brand primary
    600: '#5F48E4',
    700: '#4731C0',
    800: '#372693',
    900: '#261B69',
  },

  // Secondary — warm coral (CTA accents, "play" buttons)
  secondary: {
    50: '#FFF1EC',
    100: '#FFDED1',
    200: '#FFC2AD',
    300: '#FDA284',
    400: '#FB8363',
    500: '#EF6A49',
    600: '#CE5135',
    700: '#A53D27',
    800: '#7C2E1C',
    900: '#561F13',
  },

  // Tertiary — calm teal (growth / positive progress)
  tertiary: {
    50: '#E6F8F6',
    100: '#C0ECE7',
    200: '#8FDBD3',
    300: '#5DC5BC',
    400: '#35AAA0',
    500: '#1F8C83',
    600: '#136D65',
    700: '#0E564F',
    800: '#0A403B',
    900: '#062B28',
  },

  // Accents — pastel tints for category icon circles on cards/lists
  accentPeach: '#FDBB9F',
  accentLavender: '#C8BEFC',
  accentSky: '#A8D8FA',
  accentMint: '#B8E5C7',
  accentSunny: '#FFD985',
  accentBlush: '#F6B9C7',

  // Neutrals — slightly cool off-white to make violet pop
  neutral: {
    0: '#FFFFFF',
    25: '#FAFAFE',
    50: '#F3F3F9',
    100: '#E7E7EF',
    200: '#D2D2DD',
    300: '#A9A9B8',
    400: '#7D7D8F',
    500: '#5A5A6B',
    600: '#42424F',
    700: '#2E2E38',
    800: '#1E1E25',
    900: '#121216',
  },

  // Semantic
  success: '#1F8C83',
  warning: '#E8A53B',
  error: '#E15454',
  info: '#7B66F6',
} as const;

/**
 * Category tints — each event type has its own pastel so dashboards are
 * scannable without needing to read the icon.
 */
export const categoryColors = {
  feeding: palette.accentPeach,
  sleep: palette.accentLavender,
  diaper: palette.accentSunny,
  growth: palette.accentMint,
  milestone: palette.accentBlush,
  photo: palette.accentSky,
  reminder: palette.secondary[300],
} as const;

/**
 * Hero-card gradient — primary violet → slightly darker shade.
 */
export const heroGradient = [palette.primary[400], palette.primary[600]] as const;

export type PaletteShade = keyof typeof palette.primary;
export type CategoryColor = keyof typeof categoryColors;
