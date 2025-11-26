import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleTheme, setDarkMode } = useThemeStore((s) => ({
    isDarkMode: s.isDarkMode,
    toggleTheme: s.toggleTheme,
    setDarkMode: s.setDarkMode,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('flowgen-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('flowgen-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('flowgen-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    toggleTheme();
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme: toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
