import { type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  title: string;
  icon: IconName;
  /** Tint colour used for the icon badge and the optional "+" button. */
  tint: string;
  /** Secondary line under the title (e.g. total, latest reading). */
  subtitle?: string;
  /** Tapping the card body fires this (e.g. open history). */
  onPress?: () => void;
  /** When set, renders a "+" icon in the header (e.g. open add form). */
  onAdd?: () => void;
  /** Chart body or placeholder. */
  children: ReactNode;
};

/**
 * Shared chrome for stat cards: icon badge + title/subtitle + optional add
 * button + body. Wraps in Pressable when `onPress` is provided so the whole
 * card area is tappable for the primary action (e.g. opening history).
 */
export function ChartCard({ title, icon, tint, subtitle, onPress, onAdd, children }: Props) {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    shadows.sm,
    { backgroundColor: theme.colors.surface },
  ];

  const inner = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: tint }]}>
          <MaterialCommunityIcons name={icon} size={iconSizes.lg} color={palette.white} />
        </View>
        <View style={styles.headerText}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onAdd ? (
          <IconButton
            icon="plus"
            size={iconSizes.xl}
            onPress={onAdd}
            iconColor={tint}
            style={styles.addButton}
          />
        ) : null}
      </View>
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.85 : 1 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  addButton: { margin: 0 },
});
