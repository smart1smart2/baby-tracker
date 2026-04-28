import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette, radii } from '@/constants';
import type { Child } from '@/types/domain';

type Props = {
  child: Child;
  size: number;
};

/** Photo (when available) or sex-tinted initials inside a circle. */
export function ChildAvatar({ child, size }: Props) {
  const initials = child.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  const tintBg =
    child.sex === 'female'
      ? palette.secondary[200]
      : child.sex === 'male'
        ? palette.primary[200]
        : palette.tertiary[200];
  const tintFg =
    child.sex === 'female'
      ? palette.secondary[700]
      : child.sex === 'male'
        ? palette.primary[700]
        : palette.tertiary[700];

  if (child.avatar_url) {
    return (
      <Image
        source={{ uri: child.avatar_url }}
        style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tintBg,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { color: tintFg, fontSize: Math.round(size * 0.34) },
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
