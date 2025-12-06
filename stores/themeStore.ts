import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleTheme: () => set({ isDarkMode: !get().isDarkMode }),
      setDarkMode: (v) => set({ isDarkMode: v }),
    }),
    {
      name: 'flowgen-theme-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
