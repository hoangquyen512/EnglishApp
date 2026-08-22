import { describe, expect, it } from "vitest";
import {
  READER_PREF_KEYS,
  persistReaderPreference,
  readReaderPreferences,
  type ReaderPreferenceStorage,
} from "./reader-prefs";

function createStorage(values: Record<string, string> = {}): ReaderPreferenceStorage {
  const stored = new Map(Object.entries(values));
  return {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => {
      stored.set(key, value);
    },
  };
}

describe("readReaderPreferences", () => {
  it("reads valid language, font, and theme values from their preference keys", () => {
    const storage = createStorage({
      [READER_PREF_KEYS.languageMode]: "vi",
      [READER_PREF_KEYS.fontSize]: "xl",
      [READER_PREF_KEYS.theme]: "dark",
    });

    expect(readReaderPreferences(storage)).toEqual({
      languageMode: "vi",
      fontSize: "xl",
      theme: "dark",
    });
  });

  it("normalizes missing or unsupported values to reader defaults", () => {
    const storage = createStorage({
      [READER_PREF_KEYS.languageMode]: "fr",
      [READER_PREF_KEYS.fontSize]: "xxl",
      [READER_PREF_KEYS.theme]: "paper",
    });

    expect(readReaderPreferences(storage)).toEqual({
      languageMode: "bilingual",
      fontSize: "md",
      theme: "galaxy",
    });
    expect(readReaderPreferences(null)).toEqual({
      languageMode: "bilingual",
      fontSize: "md",
      theme: "galaxy",
    });
  });
});

describe("persistReaderPreference", () => {
  it("stores a preference under its matching reader key", () => {
    const values: Record<string, string> = {};
    const storage: ReaderPreferenceStorage = {
      getItem: (key) => values[key] ?? null,
      setItem: (key, value) => {
        values[key] = value;
      },
    };

    persistReaderPreference(storage, "languageMode", "en");
    persistReaderPreference(storage, "fontSize", "lg");
    persistReaderPreference(storage, "theme", "dark");

    expect(values).toEqual({
      "yume-reader-language-mode": "en",
      "yume-reader-font-size": "lg",
      "yume-reader-theme": "dark",
    });
  });
});
