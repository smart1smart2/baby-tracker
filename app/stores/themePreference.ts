import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceState = {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
};

export const useThemePreferenceStore = create<ThemePreferenceState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (next) => set({ preference: next }),
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
