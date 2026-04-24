import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { palette, radii, shadows, spacing } from '@/constants';
import { formatAge } from '@/lib/age';
import type { Child } from '@/types/domain';

export function ChildCard({ child }: { child: Child }) {
  const theme = useTheme();
  const initials = child.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  const avatarBg =
    child.sex === 'female'
      ? palette.secondary[200]
      : child.sex === 'male'
        ? palette.primary[200]
        : palette.tertiary[200];
  const avatarFg =
    child.sex === 'female'
      ? palette.secondary[700]
      : child.sex === 'male'
        ? palette.primary[700]
        : palette.tertiary[700];

  return (
    <View style={[styles.card, shadows.sm, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text variant="titleLarge" style={[styles.initials, { color: avatarFg }]}>
          {initials || '👶'}
        </Text>
      </View>
      <View style={styles.textBlock}>
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
          {child.full_name}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.age, { color: theme.colors.onSurfaceVariant }]}
        >
          {formatAge(child.date_of_birth)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: '700' },
  textBlock: { flex: 1, gap: spacing.xs },
  age: { marginTop: spacing.xs },
});
