import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { layout, spacing } from '@/constants';

export function FormScreen({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
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
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  content: {
    padding: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
