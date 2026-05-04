/**
 * theme.ts — MultiVera "Living Library" Theme Utilities
 *
 * Helpers for character accent colors, dark-mode toggling, and theme class
 * management.  All core logic is preserved; only visual theming is handled here.
 */

import { useEffect, useState } from 'react';

/* ── Per-Character Accent Colors ─────────────────────────────────────────── */

export interface AccentPair {
  light: string;
  dark: string;
}

/** Accent colours for every known character.  Used for chat bubbles, avatars,
 *  timeline nodes, and any UI element that should "belong" to a character. */
export const characterAccents: Record<number, AccentPair> = {
  1: { light: '#2D6A4F', dark: '#40916C' },  // Manus Flatfoot — forest green
  2: { light: '#6C4A8A', dark: '#9B7EC8' },  // Hackermouth — purple
  3: { light: '#9B2C2C', dark: '#C75050' },  // Roz Kolora — crimson
  4: { light: '#1D4E89', dark: '#4A8BD9' },  // Azula Sabra — deep blue
  5: { light: '#B8860B', dark: '#DAA520' },  // Koden Bushi — goldenrod
  6: { light: '#4A0E0E', dark: '#7A2020' },  // The Exhumerator — dark red
};

/** Return the appropriate hex accent for a character given the current theme. */
export function getCharacterAccent(
  characterId: number,
  isDark: boolean
): string {
  const pair = characterAccents[characterId];
  if (!pair) return isDark ? '#8B7EC8' : '#5B4B8A';
  return isDark ? pair.dark : pair.light;
}

/** Convenience helper: pass the id directly. */
export function characterAccentColor(id: number, dark = false): string {
  return getCharacterAccent(id, dark);
}

/* ── Theme (Dark / Light) Helpers ──────────────────────────────────────── */

const THEME_STORAGE_KEY = 'multivera-theme-dark';

/** Read the saved preference, or fall back to system preference. */
export function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Persist the user's choice and apply the `.dark` class on `<html>`. */
export function setDarkMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  if (enabled) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, String(enabled));
}

/** React hook that keeps a `darkMode` boolean in sync with the DOM class. */
export function useThemeToggle() {
  const [darkMode, setDarkModeState] = useState(() => getInitialDarkMode());

  useEffect(() => {
    setDarkMode(darkMode);
  }, [darkMode]);

  const toggle = () => setDarkModeState((prev) => !prev);

  return { darkMode, toggle, setDarkMode: setDarkModeState };
}

/** CSS variable values for inline style usage when HSL isn't enough. */
export const themeColors = {
  light: {
    background: '#FAF8F5',
    foreground: '#1A1A1A',
    card: '#FFFFFF',
    primary: '#5B4B8A',
    secondary: '#F2EFE9',
    accent: '#C2703E',
    destructive: '#B83A3A',
    border: '#DDD8D0',
  },
  dark: {
    background: '#14121A',
    foreground: '#E8E2D9',
    card: '#1C1924',
    primary: '#8B7EC8',
    secondary: '#252230',
    accent: '#D4884F',
    destructive: '#C45050',
    border: '#2E2A3A',
  },
};
