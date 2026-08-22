import { describe, expect, it } from "vitest";
import { normalizeLanguageMode } from "./language-mode";
import { READER_PREF_KEYS } from "./reader-prefs";

describe("normalizeLanguageMode", () => {
  it("defaults to bilingual for null", () => {
    expect(normalizeLanguageMode(null)).toBe("bilingual");
  });

  it("defaults to bilingual for unknown values", () => {
    expect(normalizeLanguageMode("fr")).toBe("bilingual");
    expect(normalizeLanguageMode("")).toBe("bilingual");
  });

  it("accepts valid modes", () => {
    expect(normalizeLanguageMode("bilingual")).toBe("bilingual");
    expect(normalizeLanguageMode("en")).toBe("en");
    expect(normalizeLanguageMode("vi")).toBe("vi");
  });
});

describe("READER_PREF_KEYS", () => {
  it("exposes fontSize, theme, and languageMode localStorage keys", () => {
    expect(READER_PREF_KEYS.fontSize).toBeTruthy();
    expect(READER_PREF_KEYS.theme).toBeTruthy();
    expect(READER_PREF_KEYS.languageMode).toBeTruthy();
    expect(READER_PREF_KEYS.fontSize).toMatch(/^yume-reader-/);
    expect(READER_PREF_KEYS.theme).toMatch(/^yume-reader-/);
    expect(READER_PREF_KEYS.languageMode).toMatch(/^yume-reader-/);
  });
});
