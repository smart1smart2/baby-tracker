import { MD3LightTheme, MD3DarkTheme, configureFonts, type MD3Theme } from 'react-native-paper';

import { palette } from '@/constants/colors';
import { typography } from '@/constants/typography';

const fonts = configureFonts({ config: typography });

const lightColors: MD3Theme['colors'] = {
  primary: palette.primary[500],
  onPrimary: palette.neutral[0],
  primaryContainer: palette.primary[100],
  onPrimaryContainer: palette.primary[800],

  secondary: palette.secondary[400],
  onSecondary: palette.neutral[0],
  secondaryContainer: palette.secondary[100],
  onSecondaryContainer: palette.secondary[800],

  tertiary: palette.tertiary[400],
  onTertiary: palette.neutral[0],
  tertiaryContainer: palette.tertiary[100],
  onTertiaryContainer: palette.tertiary[800],

  background: palette.neutral[50],
  onBackground: palette.neutral[800],

  surface: palette.neutral[0],
  onSurface: palette.neutral[800],

  surfaceVariant: palette.neutral[50],
  onSurfaceVariant: palette.neutral[600],
  surfaceDisabled: 'rgba(19, 18, 17, 0.12)',
  onSurfaceDisabled: 'rgba(19, 18, 17, 0.38)',

  outline: palette.neutral[200],
  outlineVariant: palette.neutral[100],

  error: palette.error,
  onError: palette.neutral[0],
  errorContainer: '#FFE1E1',
  onErrorContainer: '#5D1111',

  shadow: '#000000',
  scrim: '#000000',
  backdrop: 'rgba(19, 18, 17, 0.5)',

  inverseSurface: palette.neutral[800],
  inverseOnSurface: palette.neutral[50],
  inversePrimary: palette.primary[200],

  elevation: {
    level0: 'transparent',
    level1: palette.neutral[25],
    level2: palette.neutral[50],
    level3: palette.neutral[100],
    level4: palette.neutral[100],
    level5: palette.neutral[200],
  },
};

const darkColors: MD3Theme['colors'] = {
  primary: palette.primary[300],
  onPrimary: palette.primary[800],
  primaryContainer: palette.primary[700],
  onPrimaryContainer: palette.primary[100],

  secondary: palette.secondary[300],
  onSecondary: palette.secondary[800],
  secondaryContainer: palette.secondary[700],
  onSecondaryContainer: palette.secondary[100],

  tertiary: palette.tertiary[300],
  onTertiary: palette.tertiary[800],
  tertiaryContainer: palette.tertiary[700],
  onTertiaryContainer: palette.tertiary[100],

  background: palette.neutral[900],
  onBackground: palette.neutral[50],

  surface: palette.neutral[800],
  onSurface: palette.neutral[50],

  surfaceVariant: palette.neutral[700],
  onSurfaceVariant: palette.neutral[300],
  surfaceDisabled: 'rgba(253, 251, 247, 0.12)',
  onSurfaceDisabled: 'rgba(253, 251, 247, 0.38)',

  outline: palette.neutral[600],
  outlineVariant: palette.neutral[700],

  error: '#FF9A9A',
  onError: '#5D1111',
  errorContainer: '#7A2A2A',
  onErrorContainer: '#FFE1E1',

  shadow: '#000000',
  scrim: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.6)',

  inverseSurface: palette.neutral[50],
  inverseOnSurface: palette.neutral[800],
  inversePrimary: palette.primary[600],

  elevation: {
    level0: 'transparent',
    level1: palette.neutral[800],
    level2: palette.neutral[700],
    level3: palette.neutral[700],
    level4: palette.neutral[700],
    level5: palette.neutral[600],
  },
};

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: lightColors,
  fonts,
  roundness: 4,
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts,
  roundness: 4,
};
