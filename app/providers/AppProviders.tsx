import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ActionSheetProvider } from '@/components/ActionSheet';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import { queryClient } from '@/lib/queryClient';
import { paperDarkTheme, paperLightTheme } from '@/lib/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from './AuthProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? paperDarkTheme : paperLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <AuthProvider>
              <ConfirmProvider>
                <ActionSheetProvider>{children}</ActionSheetProvider>
              </ConfirmProvider>
            </AuthProvider>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
