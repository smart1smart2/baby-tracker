import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, radii, spacing } from '@/constants';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
  title: string;
  subtitle?: string;
  time?: string;
};

export function EventListItem({ icon, tint, title, subtitle, time }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon} size={iconSizes.md} color="#FFFFFF" />
      </View>
      <View style={styles.textBlock}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {time ? (
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {time}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
});
