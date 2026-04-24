import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppProviders } from '@/providers/AppProviders';
import { AuthGate } from '@/components/AuthGate';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <AppProviders>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="children/new" options={{ title: 'Нова дитина', presentation: 'modal' }} />
          <Stack.Screen name="feedings/new" options={{ title: 'Годування', presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </AuthGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </AppProviders>
  );
}
