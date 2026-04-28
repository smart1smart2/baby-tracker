import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import '@/i18n';
import { AppProviders } from '@/providers/AppProviders';
import { AuthGate } from '@/components/AuthGate';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <AppProviders>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="children/new"
            options={{ title: t('children.new.screenTitle'), presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="children/[id]/edit"
            options={{ title: t('children.edit.screenTitle'), presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="feedings/new"
            options={{ title: t('feedings.new.screenTitle'), presentation: 'fullScreenModal' }}
          />
        </Stack>
      </AuthGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </AppProviders>
  );
}
