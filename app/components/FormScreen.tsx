import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';

import { iconSizes, layout, spacing } from '@/constants';

type Props = {
  children: ReactNode;
  /** When provided, renders an X close button on the right of the modal header. */
  onClose?: () => void;
};

/**
 * Consistent wrapper for modal/stack form screens.
 *  - keyboard-aware ScrollView with the project's screen padding
 *  - reads background colour from the active theme
 *  - if `onClose` is supplied, registers a close button on the header
 *    so every form screen can be dismissed the same way
 */
export function FormScreen({ children, onClose }: Props) {
  const theme = useTheme();

  return (
    <>
      {onClose ? (
        <Stack.Screen
          options={{
            headerLeft: () => null,
            headerRight: () => (
              <IconButton
                icon="close"
                size={iconSizes.lg}
                onPress={onClose}
                style={styles.closeButton}
              />
            ),
          }}
        />
      ) : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.kav, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  content: {
    padding: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  closeButton: { marginTop: spacing.xs },
});
