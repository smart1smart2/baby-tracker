import { type ReactNode } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { layout, spacing } from '@/constants';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: readonly Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
};

const DEFAULT_EDGES: readonly Edge[] = ['top'];

export function ScreenContainer({
  children,
  scroll = true,
  edges = DEFAULT_EDGES,
  refreshing,
  onRefresh,
}: Props) {
  const theme = useTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.staticContent}>{children}</View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={edges}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: layout.screenPadding,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  staticContent: {
    flex: 1,
    padding: layout.screenPadding,
    gap: spacing.lg,
  },
});
