import { Platform, type ViewStyle } from 'react-native';

/**
 * Elevation scale — soft, low-contrast shadows that feel gentle and modern.
 * On Android we fall back to native elevation; on iOS we craft the shadow by hand.
 */

const ios = (
  offsetY: number,
  radius: number,
  opacity: number,
): ViewStyle => ({
  shadowColor: '#1A1F33',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

const android = (elevation: number): ViewStyle => ({ elevation });

export const shadows: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', ViewStyle> = {
  none: Platform.OS === 'ios' ? ios(0, 0, 0) : android(0),
  sm: Platform.OS === 'ios' ? ios(1, 2, 0.04) : android(1),
  md: Platform.OS === 'ios' ? ios(2, 8, 0.08) : android(3),
  lg: Platform.OS === 'ios' ? ios(6, 16, 0.1) : android(6),
  xl: Platform.OS === 'ios' ? ios(12, 28, 0.12) : android(10),
};

export type ShadowLevel = keyof typeof shadows;
