import { useCallback, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'fftvera-theme';

/** The user's persisted theme, defaulting to Obsidian (dark). */
export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Apply a theme to the document and persist the choice. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — the in-memory attribute still applies */
  }
}

/** React hook for reading and switching the active theme. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);
  return { theme, setTheme };
}
