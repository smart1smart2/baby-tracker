import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, radii, shadows, spacing } from '@/constants';

export type StatItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
  value: string;
  label: string;
};

export function StatsRow({ items }: { items: StatItem[] }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[
            styles.pill,
            shadows.sm,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.tint }]}>
            <MaterialCommunityIcons
              name={item.icon}
              size={iconSizes.md}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.textBlock}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {item.value}
            </Text>
            <Text
              variant="labelSmall"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {item.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
});
