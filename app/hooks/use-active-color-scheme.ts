import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';
import { useThemePreferenceStore } from '@/stores/themePreference';

/**
 * Resolves the user's theme preference into a concrete `'light' | 'dark'`
 * scheme. When the preference is `'system'` we fall back to the OS, so
 * existing consumers that always saw `useColorScheme()` keep working.
 */
export function useActiveColorScheme(): 'light' | 'dark' {
  const preference = useThemePreferenceStore((s) => s.preference);
  const system = useSystemColorScheme();
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'dark' ? 'dark' : 'light';
}
