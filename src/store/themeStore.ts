import type { StateCreator } from 'zustand';
import type { Theme } from '../types';

export type ThemeSlice = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((s) => ({
      theme: s.theme === 'dark' ? 'light' : 'dark',
    })),
  setTheme: (theme) => set({ theme }),
});
