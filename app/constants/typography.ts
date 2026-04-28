/**
 * Typography scale — follows Material Design 3 type system.
 * System fonts only (no custom font loading) to keep bundle small.
 *
 * Semantic role → variant cheat sheet (use these consistently):
 *  - Brand wordmark (auth only):           displaySmall   (32px / 700)
 *  - Hero greeting:                        headlineLarge  (28px / 700)
 *  - Section header on a screen:           titleLarge     (20px / 600)
 *  - Card hero / focused-entity name:      headlineSmall  (20px / 600)
 *  - Stat figure / prominent number:       headlineSmall  (20px / 600)
 *  - Card row title (action, event):       titleSmall     (14px / 600)
 *  - Body text / age / descriptive:        bodyMedium     (14px / 400)
 *  - Emphasised body (hero subtitle):      bodyLarge      (16px / 400)
 *  - Caption / muted note:                 bodySmall      (12px / 400)
 *  - Form / button label:                  labelLarge     (14px / 600)
 *  - Pill toggle, list timestamp:          labelMedium    (12px / 600)
 *  - Tiny stat label / category caption:   labelSmall     (11px / 600)
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
