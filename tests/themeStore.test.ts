import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../stores/themeStore';

describe('Theme Store', () => {
  beforeEach(() => {
    useThemeStore.setState({ isDarkMode: false });
    localStorage.removeItem('flowgen-theme-store');
    localStorage.removeItem('flowgen-theme');
  });

  it('toggleTheme alterna isDarkMode', () => {
    expect(useThemeStore.getState().isDarkMode).toBe(false);
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDarkMode).toBe(true);
  });

  it('persiste estado', () => {
    useThemeStore.getState().setDarkMode(true);
    const raw = localStorage.getItem('flowgen-theme-store');
    expect(raw).toBeTruthy();
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed?.state?.isDarkMode).toBe(true);
  });
});

