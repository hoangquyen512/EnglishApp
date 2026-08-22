import { normalizeLanguageMode } from "./language-mode";
import type { ReaderLanguageMode } from "./types";

export type ReaderFontSize = "sm" | "md" | "lg" | "xl";
export type ReaderTheme = "galaxy" | "dark";

export interface ReaderPreferences {
  languageMode: ReaderLanguageMode;
  fontSize: ReaderFontSize;
  theme: ReaderTheme;
}

export interface ReaderPreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const READER_PREF_KEYS = {
  fontSize: "yume-reader-font-size",
  theme: "yume-reader-theme",
  languageMode: "yume-reader-language-mode",
} as const;

export const READER_FONT_SIZES: readonly ReaderFontSize[] = ["sm", "md", "lg", "xl"];

const VALID_FONT_SIZES = new Set<ReaderFontSize>(READER_FONT_SIZES);
const VALID_THEMES = new Set<ReaderTheme>(["galaxy", "dark"]);

function readStoredValue(
  storage: ReaderPreferenceStorage | null,
  key: string,
): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function normalizeReaderFontSize(raw: string | null): ReaderFontSize {
  return raw && VALID_FONT_SIZES.has(raw as ReaderFontSize)
    ? (raw as ReaderFontSize)
    : "md";
}

export function normalizeReaderTheme(raw: string | null): ReaderTheme {
  return raw && VALID_THEMES.has(raw as ReaderTheme) ? (raw as ReaderTheme) : "galaxy";
}

export function readReaderPreferences(
  storage: ReaderPreferenceStorage | null,
): ReaderPreferences {
  return {
    languageMode: normalizeLanguageMode(
      readStoredValue(storage, READER_PREF_KEYS.languageMode),
    ),
    fontSize: normalizeReaderFontSize(readStoredValue(storage, READER_PREF_KEYS.fontSize)),
    theme: normalizeReaderTheme(readStoredValue(storage, READER_PREF_KEYS.theme)),
  };
}

export function persistReaderPreference<K extends keyof ReaderPreferences>(
  storage: ReaderPreferenceStorage | null,
  preference: K,
  value: ReaderPreferences[K],
): void {
  try {
    storage?.setItem(READER_PREF_KEYS[preference], value);
  } catch {
    // Preferences remain available for the current reader session.
  }
}
