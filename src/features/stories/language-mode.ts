import type { ReaderLanguageMode } from "./types";

export const READER_PREF_KEYS = {
  fontSize: "yume-reader-font-size",
  theme: "yume-reader-theme",
  languageMode: "yume-reader-language-mode",
} as const;

const VALID_MODES = new Set<ReaderLanguageMode>(["bilingual", "en", "vi"]);

export function normalizeLanguageMode(raw: string | null): ReaderLanguageMode {
  if (raw && VALID_MODES.has(raw as ReaderLanguageMode)) {
    return raw as ReaderLanguageMode;
  }
  return "bilingual";
}
