import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ThemeState = {
    themeMode: 'system' | 'light' | 'dark';
    setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeMode: 'system',
            setThemeMode: (mode) => set({ themeMode: mode }),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
