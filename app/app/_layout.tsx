import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useTheme } from 'react-native-paper';

import '@/i18n';
import { AppProviders } from '@/providers/AppProviders';
import { AuthGate } from '@/components/AuthGate';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { useActiveColorScheme } from '@/hooks/use-active-color-scheme';
import { useChildRealtime } from '@/lib/realtime';
import { initSentry, Sentry, sentryEnabled } from '@/lib/sentry';
import { useRasp } from '@/lib/rasp';
import { useActiveChild } from '@/stores/activeChild';

// freeRASP requires a native dev/production build — not available in Expo Go
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

initSentry();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RealtimeBridge() {
  const activeChildId = useActiveChild((s) => s.activeChildId);
  useChildRealtime(activeChildId);
  return null;
}

function RaspBridge() {
  useRasp();
  return null;
}

function NavigationStack() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        presentation: 'fullScreenModal',
        headerLeft: () => null,
        headerRight: () => <ModalCloseButton />,
        headerBackVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="children/new" options={{ title: t('children.new.screenTitle') }} />
      <Stack.Screen name="children/[id]/edit" options={{ title: t('children.edit.screenTitle') }} />
      <Stack.Screen name="feedings/new" options={{ title: t('feedings.new.screenTitle') }} />
      <Stack.Screen name="feedings/index" options={{ title: t('history.feedings') }} />
      <Stack.Screen name="sleeps/new" options={{ title: t('sleeps.new.screenTitle') }} />
      <Stack.Screen name="sleeps/index" options={{ title: t('history.sleeps') }} />
      <Stack.Screen name="diapers/new" options={{ title: t('diapers.new.screenTitle') }} />
      <Stack.Screen name="diapers/index" options={{ title: t('history.diapers') }} />
      <Stack.Screen name="measurements/new" options={{ title: t('measurements.new.screenTitle') }} />
      <Stack.Screen name="measurements/index" options={{ title: t('history.measurements') }} />
      <Stack.Screen name="account/profile" options={{ title: t('settings.profileEdit.screenTitle') }} />
      <Stack.Screen name="account/password" options={{ title: t('settings.password.screenTitle') }} />
      <Stack.Screen name="milestones/index" options={{ title: t('milestones.screenTitle') }} />
      <Stack.Screen name="milestones/[code]" options={{ title: t('milestones.detail.screenTitle') }} />
      <Stack.Screen name="vaccinations/index" options={{ title: t('vaccinations.screenTitle') }} />
      <Stack.Screen name="vaccinations/[code]" options={{ title: t('vaccinations.detail.screenTitle') }} />
    </Stack>
  );
}

function RootLayout() {
  const scheme = useActiveColorScheme();

  return (
    <AppProviders>
      <AuthGate>
        <RealtimeBridge />
        {!IS_EXPO_GO ? <RaspBridge /> : null}
        <NavigationStack />
      </AuthGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </AppProviders>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
