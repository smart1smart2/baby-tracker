import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Small uppercase section label used above grouped fields in forms
 * (e.g. "TYPE" before a KindGrid). Centralises the typography so all
 * form sections feel the same.
 */
export function SectionLabel({ children, style }: Props) {
  const theme = useTheme();
  return (
    <Text
      variant="labelSmall"
      style={[styles.label, { color: theme.colors.onSurfaceVariant }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
