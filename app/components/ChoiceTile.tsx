import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, radii, spacing } from '@/constants';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  tint: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Selectable tile with a tinted icon and label. Used in choice lists like
 * "sex" / "feeding kind". When selected, the tile fills with its tint and
 * draws a coloured outline; otherwise it's a neutral surface card.
 */
export function ChoiceTile({ icon, label, tint, selected, onPress }: Props) {
  const theme = useTheme();
  const bg = selected ? tint : theme.colors.surface;
  const fg = selected ? '#FFFFFF' : theme.colors.onSurface;
  const border = selected ? tint : theme.colors.outline;
  const iconColor = selected ? '#FFFFFF' : tint;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.iconWrap, { backgroundColor: selected ? 'rgba(255,255,255,0.18)' : `${tint}22` }]}>
        <MaterialCommunityIcons name={icon} size={iconSizes.lg} color={iconColor} />
      </View>
      <Text variant="labelLarge" style={[styles.label, { color: fg, fontWeight: '600' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
