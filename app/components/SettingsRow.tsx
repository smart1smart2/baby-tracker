import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, palette, radii, spacing } from '@/constants';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  icon: IconName;
  tint?: string;
  label: string;
  value?: string;
  destructive?: boolean;
  onPress?: () => void;
};

export function SettingsRow({ icon, tint, label, value, destructive, onPress }: Props) {
  const theme = useTheme();
  const labelColor = destructive ? theme.colors.error : theme.colors.onSurface;
  const iconBg = tint ?? (destructive ? theme.colors.error : theme.colors.primary);

  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={iconSizes.sm} color={palette.white} />
      </View>
      <View style={styles.textBlock}>
        <Text variant="titleSmall" style={{ color: labelColor }}>
          {label}
        </Text>
        {value ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {value}
          </Text>
        ) : null}
      </View>
      {onPress ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={iconSizes.md}
          color={theme.colors.onSurfaceVariant}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
});
