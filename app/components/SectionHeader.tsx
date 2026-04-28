import { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { spacing } from '@/constants';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: { flex: 1, gap: spacing.xs },
  subtitle: { marginTop: spacing.xs },
  right: { marginLeft: spacing.sm },
});
