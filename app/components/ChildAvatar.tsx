import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette, radii } from '@/constants';
import type { Child, Sex } from '@/types/domain';

type Props = {
  child: Child;
  size: number;
};

const TINTS: Record<Sex, { bg: string; fg: string }> = {
  female: { bg: palette.secondary[200], fg: palette.secondary[700] },
  male: { bg: palette.primary[200], fg: palette.primary[700] },
  unspecified: { bg: palette.tertiary[200], fg: palette.tertiary[700] },
};

/** Photo (when available) or sex-tinted initials inside a circle. */
export function ChildAvatar({ child, size }: Props) {
  const initials = child.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  if (child.avatar_url) {
    return (
      <Image
        source={{ uri: child.avatar_url }}
        style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  const { bg, fg } = TINTS[(child.sex as Sex) ?? 'unspecified'] ?? TINTS.unspecified;

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { color: fg, fontSize: Math.round(size * 0.34) },
        ]}
      >
        {initials || '👶'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.pill, overflow: 'hidden' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});
