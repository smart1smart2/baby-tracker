import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import '@/i18n';
import { AppProviders } from '@/providers/AppProviders';
import { AuthGate } from '@/components/AuthGate';
import { HeaderBackButton } from '@/components/HeaderBackButton';
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
        <Stack
          screenOptions={{
            headerBackButtonDisplayMode: 'minimal',
            headerLeft: () => <HeaderBackButton />,
          }}
        >
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
          <Stack.Screen
            name="feedings/index"
            options={{ title: t('history.feedings') }}
          />
          <Stack.Screen
            name="sleeps/new"
            options={{ title: t('sleeps.new.screenTitle'), presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="sleeps/index"
            options={{ title: t('history.sleeps') }}
          />
          <Stack.Screen
            name="diapers/new"
            options={{ title: t('diapers.new.screenTitle'), presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="diapers/index"
            options={{ title: t('history.diapers') }}
          />
          <Stack.Screen
            name="measurements/new"
            options={{ title: t('measurements.new.screenTitle'), presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="measurements/index"
            options={{ title: t('history.measurements') }}
          />
        </Stack>
      </AuthGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </AppProviders>
  );
}
