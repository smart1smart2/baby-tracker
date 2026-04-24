import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ActiveChildState = {
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
};

export const useActiveChild = create<ActiveChildState>()(
  persist(
    (set) => ({
      activeChildId: null,
      setActiveChildId: (id) => set({ activeChildId: id }),
    }),
    {
      name: 'active-child',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
