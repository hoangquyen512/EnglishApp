import type { ReaderLanguageMode } from "./types";

const VALID_MODES = new Set<ReaderLanguageMode>(["bilingual", "en", "vi"]);

export function normalizeLanguageMode(raw: string | null): ReaderLanguageMode {
  if (raw && VALID_MODES.has(raw as ReaderLanguageMode)) {
    return raw as ReaderLanguageMode;
  }
  return "bilingual";
}
