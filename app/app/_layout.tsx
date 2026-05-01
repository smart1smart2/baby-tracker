import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import '@/i18n';
import { AppProviders } from '@/providers/AppProviders';
import { AuthGate } from '@/components/AuthGate';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { useActiveColorScheme } from '@/hooks/use-active-color-scheme';
import { initSentry, Sentry, sentryEnabled } from '@/lib/sentry';

initSentry();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  const scheme = useActiveColorScheme();
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
          <Stack.Screen
            name="account/profile"
            options={{ title: t('settings.profileEdit.screenTitle') }}
          />
          <Stack.Screen
            name="account/password"
            options={{ title: t('settings.password.screenTitle') }}
          />
          <Stack.Screen
            name="milestones/index"
            options={{ title: t('milestones.screenTitle') }}
          />
          <Stack.Screen
            name="milestones/[code]"
            options={{ title: t('milestones.detail.screenTitle'), presentation: 'fullScreenModal' }}
          />
        </Stack>
      </AuthGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </AppProviders>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
