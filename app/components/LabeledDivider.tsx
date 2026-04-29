import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { spacing } from '@/constants';

type Props = {
  children: string;
};

/**
 * Horizontal hairline rule with a small centered label, used in forms to
 * separate two ways of doing the same thing (e.g. "start now" timer vs
 * "or log past" manual entry).
 */
export function LabeledDivider({ children }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {children}
      </Text>
      <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
});
