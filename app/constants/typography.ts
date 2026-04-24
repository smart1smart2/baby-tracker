/**
 * Typography scale — follows Material Design 3 type system.
 * System fonts only (no custom font loading) to keep bundle small.
 */
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
}) as string;

type TypographyRole = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing: number;
};

const role = (
  fontSize: number,
  lineHeight: number,
  fontWeight: TypographyRole['fontWeight'] = '400',
  letterSpacing = 0,
): TypographyRole => ({ fontFamily, fontSize, lineHeight, fontWeight, letterSpacing });

export const typography = {
  displayLarge: role(48, 56, '700', -0.5),
  displayMedium: role(40, 48, '700', -0.25),
  displaySmall: role(32, 40, '700', 0),

  headlineLarge: role(28, 36, '700', 0),
  headlineMedium: role(24, 32, '700', 0),
  headlineSmall: role(20, 28, '600', 0),

  titleLarge: role(20, 28, '600', 0),
  titleMedium: role(16, 24, '600', 0.15),
  titleSmall: role(14, 20, '600', 0.1),

  bodyLarge: role(16, 24, '400', 0.15),
  bodyMedium: role(14, 20, '400', 0.25),
  bodySmall: role(12, 16, '400', 0.4),

  labelLarge: role(14, 20, '600', 0.1),
  labelMedium: role(12, 16, '600', 0.5),
  labelSmall: role(11, 16, '600', 0.5),
} as const;

export type TypographyVariant = keyof typeof typography;
