import { type ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { radii, spacing } from '@/constants';

type Props = Omit<ComponentProps<typeof Button>, 'mode' | 'contentStyle'>;

/**
 * Primary contained button used at the bottom of every form screen
 * (Save, Start now, Stop now). Bakes in the rounded pill shape and
 * comfortable vertical padding so individual forms don't reinvent them.
 * Pass `style` to add layout (e.g. marginTop) — visual styling is fixed.
 */
export function FormSubmitButton({ style, children, ...rest }: Props) {
  return (
    <Button
      mode="contained"
      contentStyle={styles.content}
      style={[styles.button, style]}
      {...rest}
    >
      {children}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radii.xl },
  content: { paddingVertical: spacing.md },
});
