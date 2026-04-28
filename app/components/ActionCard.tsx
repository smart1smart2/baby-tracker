import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  hint?: string;
  tint: string;
  onPress: () => void;
};

export function ActionCard({ icon, label, hint, tint, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [
        styles.card,
        shadows.sm,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon} size={iconSizes.lg} color={palette.white} />
      </View>
      <View style={styles.textBlock}>
        <Text
          variant="titleSmall"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={[styles.label, { color: theme.colors.onSurface }]}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            variant="bodySmall"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    minHeight: 76,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
  label: { fontWeight: '700' },
});
