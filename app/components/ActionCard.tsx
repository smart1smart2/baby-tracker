import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, radii, shadows, spacing } from '@/constants';

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
        <MaterialCommunityIcons name={icon} size={iconSizes.xl} color="#FFFFFF" />
      </View>
      <Text variant="titleSmall" style={[styles.label, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radii.xl,
    gap: spacing.sm,
    minHeight: 124,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '700' },
});
