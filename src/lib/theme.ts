/**
 * theme.ts — ChronoVera "Ivalice" Theme Utilities
 *
 * CT-themed accent colors, zodiac sign mappings, and character avatars.
 * Each major character is associated with a Zodiac Stone / Auracite reference.
 */

import { useEffect, useState } from 'react';

/* ── Per-Character Accent Colors ─────────────────────────────────────────── */

export interface AccentPair {
  light: string;
  dark: string;
}

/**
 * Accent colors for CT characters.
 * Each character's color is inspired by their Zodiac Stone / elemental affinity.
 *
 * Ramza — no Zodiac Stone, but associated with the "light" of truth (gold/white)
 * Delita — associated with the Lucavi / darkness (crimson/black)
 * Agrias — Holy Knight of the Round, associated with faith (royal blue)
 * Mustadio — Engineer, associated with earth/steel (bronze/gold)
 * Rapha — Skyseer, associated with wind/sky (violet/purple)
 * Marach — Skyseer's brother, associated with darker wind (dark crimson)
 * Alma — Ramza's sister, associated with purity (soft white/blue)
 * Wiegraf — the antagonist, associated with the Lucavi (dark purple)
 * Dycedarg — Ramza's father, associated with corruption (dark green)
 * Larg — Duke of the Beoulve family (deep red)
 * Goffard — noble turned villain (steel grey)
 * Elmdore — the "Lion" prince (bright gold)
 * Meliadoul — Templar Knight (silver/white)
 * Orran — the Astrologer (deep indigo/stars)
 */
export const characterAccents: Record<number, AccentPair> = {
  1: { light: '#B8960C', dark: '#D4B85C' },  // Ramza — gold (light of truth)
  2: { light: '#8B1A1A', dark: '#C04040' },  // Delita — crimson (Lucavi darkness)
  3: { light: '#1A3A7A', dark: '#4A7AD0' },  // Agrias — royal blue (faith)
  4: { light: '#8B6914', dark: '#C89830' },  // Mustadio — bronze (engineer)
  5: { light: '#5B2D8B', dark: '#8B5FC0' },  // Rapha — violet (sky/wind)
  6: { light: '#6B1010', dark: '#A03030' },  // Marach — dark crimson
  7: { light: '#4A7A9B', dark: '#7AB0D0' },  // Alma — soft blue (purity)
  8: { light: '#4A1A6B', dark: '#7A4AA0' },  // Wiegraf — dark purple (Lucavi)
  9: { light: '#2A5A2A', dark: '#4A8A4A' },  // Dycedarg — dark green (corruption)
  10: { light: '#7A1A1A', dark: '#B04040' }, // Larg — deep red
  11: { light: '#4A4A5A', dark: '#7A7A8A' }, // Goffard — steel grey
  12: { light: '#C8A020', dark: '#E0C040' }, // Elmdore — bright gold (the Lion)
  13: { light: '#6A7A8A', dark: '#9AADBD' }, // Meliadoul — silver (Templar)
  14: { light: '#1A1A4A', dark: '#3A3A8A' }, // Orran — deep indigo (astrologer)
};

/** Return the appropriate hex accent for a character given the current theme. */
export function getCharacterAccent(
  characterId: number,
  isDark: boolean
): string {
  const pair = characterAccents[characterId];
  if (!pair) return isDark ? '#D4B85C' : '#B8960C';
  return isDark ? pair.dark : pair.light;
}

/** Convenience helper: pass the id directly. */
export function characterAccentColor(id: number, dark = false): string {
  return getCharacterAccent(id, dark);
}

/* ── Zodiac Stone / Auracite Reference ──────────────────────────────────── */

export interface ZodiacInfo {
  name: string;
  element: string;
  color: string;
  description: string;
}

export const zodiacStones: Record<string, ZodiacInfo> = {
  belias: { name: 'Belias', element: 'Fire', color: 'hsl(var(--zodiac-fire))', description: 'The Archfiend of Fire. Sealed in the Zodiac Stone.' },
  hashmal: { name: 'Hashmal', element: 'Earth', color: 'hsl(var(--zodiac-earth))', description: 'The Archfiend of Earth. Bringer of order through destruction.' },
  cuchulainn: { name: 'Cuchulainn', element: 'Wind', color: 'hsl(var(--zodiac-wind))', description: 'The Impure. Wields the power of miasma.' },
  mateus: { name: 'Mateus', element: 'Ice', color: 'hsl(var(--zodiac-water))', description: 'The Corrupt. Lord of the frozen wastes.' },
  adrammelech: { name: 'Adrammelech', element: 'Lightning', color: 'hsl(var(--zodiac-light))', description: 'The Wyrmking. Ruler of the sky.' },
  zalera: { name: 'Zalera', element: 'Poison', color: 'hsl(var(--zodiac-light))', description: 'The Death Seraph. Bringer of the end.' },
  shemhazai: { name: 'Shemhazai', element: 'Earth', color: 'hsl(var(--zodiac-earth))', description: 'The Dark Angel. Guardian of the Zodiac.' },
  zeromus: { name: 'Zeromus', element: 'Dark', color: 'hsl(var(--zodiac-dark))', description: 'The Darkening Cloud. The ultimate Lucavi.' },
  ultima: { name: 'Ultima', element: 'Holy', color: 'hsl(var(--auracite))', description: 'The High Seraph. The most powerful Lucavi.' },
  exodus: { name: 'Exodus', element: 'Dark', color: 'hsl(var(--zodiac-dark))', description: 'The Tree of Life. Manipulator of fate.' },
};

/* ── Theme (Dark / Light) Helpers ──────────────────────────────────────── */

const THEME_STORAGE_KEY = 'chronovera-theme-dark';

/** Read the saved preference, or fall back to system preference. */
export function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return true; // Default to dark for CT vibe
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

/** Avatar image paths for CT characters. */
export const avatarImages: Record<number, string> = {
  1: '/characters/ramza.png',
  2: '/characters/delita.png',
  3: '/characters/agrias.png',
  4: '/characters/mustadio.png',
  5: '/characters/rapha.png',
  6: '/characters/marach.png',
  7: '/characters/alma.png',
  8: '/characters/wiegraf.png',
  9: '',  // Dycedarg - not generated yet
  10: '', // Larg - not generated yet
  11: '/characters/goffard.png',
  12: '/characters/elmdore.png',
  13: '/characters/meliadoul.png',
  14: '/characters/orran.png',
};

/** Return the avatar image path for a character, or a fallback generic avatar. */
export function getCharacterAvatar(id: number): string {
  return avatarImages[id] ?? '';
}

/** CSS variable values for inline style usage when HSL isn't enough. */
export const themeColors = {
  light: {
    background: '#F0EBE0',
    foreground: '#1A1A2E',
    card: '#F7F3EA',
    primary: '#B8960C',
    secondary: '#E5DDD0',
    accent: '#1B2A4A',
    destructive: '#8B2020',
    border: '#D0C8B8',
    auracite: '#7B3F9E',
  },
  dark: {
    background: '#0D1220',
    foreground: '#E0D8C8',
    card: '#141C2E',
    primary: '#D4B85C',
    secondary: '#1A2440',
    accent: '#9B5FC4',
    destructive: '#B04040',
    border: '#2A3450',
    auracite: '#9B5FC4',
  },
};

/* ── Ivalice Lore Constants ─────────────────────────────────────────────── */

export const IVALICE_LORE = {
  locations: [
    'Goug Machine City', 'Zarghidas Trade City', 'Dorter Trade City',
    'Bervenia Free City', 'Limberry Castle', 'Mandalia Plains',
    'Siedge Tower', 'Orbonne Monastery', 'Golanda',
    'Lesalia', 'Balka', 'St. Murond Temple',
    'Chapel of Orbonne', 'The Deep', 'Riovanes Castle',
  ],
  factions: [
    'The Beoulve Family', 'The Hokuten', 'The Nanten',
    'The Church of Glabados', 'The Lucavi', 'The Corpse Brigade',
    'The Knights Templar', 'The Order of the Northern Sky',
    'The Order of the Southern Sky',
  ],
  concepts: [
    'Zodiac Stones', 'Auracite', 'The Lucavi', 'The War of the Lions',
    'The Corpse Brigade', 'The Germonik Scriptures',
    'The Knights Templar', 'The St. Murond Accord',
  ],
};
