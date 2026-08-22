import { describe, expect, it, vi } from "vitest";
import { lookupWord, NETWORK_LOOKUP_ERROR, NOT_FOUND_LOOKUP_ERROR } from "./lookup";
import type { DictionaryCacheEntry } from "./types";

function cached(overrides: Partial<DictionaryCacheEntry> = {}): DictionaryCacheEntry {
  return {
    word: "hello",
    phoneticIpa: "/həˈloʊ/",
    partOfSpeech: "noun",
    meaningVi: "xin chào",
    definitionEn: "A greeting.",
    exampleEn: "Hello!",
    source: "dictionaryapi+libretranslate",
    cachedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("lookupWord", () => {
  it("returns cache hit without calling network", async () => {
    const getCached = vi.fn().mockResolvedValue(cached());
    const fetchEn = vi.fn();
    const translateVi = vi.fn();
    const saveCache = vi.fn();

    const result = await lookupWord("  Hello ", {
      getCached,
      fetchEn,
      translateVi,
      saveCache,
    });

    expect(result).toEqual(cached());
    expect(getCached).toHaveBeenCalledWith("hello");
    expect(fetchEn).not.toHaveBeenCalled();
    expect(translateVi).not.toHaveBeenCalled();
    expect(saveCache).not.toHaveBeenCalled();
  });

  it("fetches, translates, caches, and returns on miss", async () => {
    const getCached = vi.fn().mockResolvedValue(null);
    const fetchEn = vi.fn().mockResolvedValue({
      word: "hello",
      phoneticIpa: "/həˈloʊ/",
      partOfSpeech: "noun",
      definitionEn: "A greeting.",
      exampleEn: "Hello!",
    });
    const translateVi = vi.fn().mockResolvedValue("xin chào");
    const saveCache = vi.fn().mockImplementation(async (entry: DictionaryCacheEntry) => entry);

    const result = await lookupWord("hello", {
      getCached,
      fetchEn,
      translateVi,
      saveCache,
    });

    expect(result.word).toBe("hello");
    expect(result.meaningVi).toBe("xin chào");
    expect(result.phoneticIpa).toBe("/həˈloʊ/");
    expect(result.partOfSpeech).toBe("noun");
    expect(result.source).toBe("dictionaryapi+translate");
    expect(saveCache).toHaveBeenCalledOnce();
    expect(translateVi).toHaveBeenCalledWith("hello");
  });

  it("retranslates when the cache stored English as the Vietnamese meaning", async () => {
    const getCached = vi.fn().mockResolvedValue(
      cached({
        meaningVi: "A greeting.",
        definitionEn: "A greeting.",
        source: "dictionaryapi",
      }),
    );
    const fetchEn = vi.fn();
    const translateVi = vi.fn().mockResolvedValue("lời chào");
    const saveCache = vi.fn().mockImplementation(async (entry: DictionaryCacheEntry) => entry);

    const result = await lookupWord("hello", {
      getCached,
      fetchEn,
      translateVi,
      saveCache,
    });

    expect(translateVi).toHaveBeenCalledWith("hello");
    expect(result.meaningVi).toBe("lời chào");
    expect(fetchEn).not.toHaveBeenCalled();
  });

  it("translates the headword, not the long English definition", async () => {
    const getCached = vi.fn().mockResolvedValue(null);
    const fetchEn = vi.fn().mockResolvedValue({
      word: "hello",
      phoneticIpa: "/həˈloʊ/",
      partOfSpeech: "noun",
      definitionEn: "A greeting.",
      exampleEn: "Hello!",
    });
    const translateVi = vi.fn().mockResolvedValue("xin chào");
    const saveCache = vi.fn().mockImplementation(async (entry: DictionaryCacheEntry) => entry);

    const result = await lookupWord("hello", {
      getCached,
      fetchEn,
      translateVi,
      saveCache,
    });

    expect(translateVi).toHaveBeenCalledWith("hello");
    expect(result.meaningVi).toBe("xin chào");
  });

  it("retranslates a long-winded cached Vietnamese gloss", async () => {
    const getCached = vi.fn().mockResolvedValue(
      cached({
        word: "project",
        meaningVi: "Một nỗ lực có kế hoạch, thường là với một mục tiêu cụ thể.",
        definitionEn: "A planned endeavor.",
      }),
    );
    const translateVi = vi.fn().mockResolvedValue("dự án");
    const saveCache = vi.fn().mockImplementation(async (entry: DictionaryCacheEntry) => entry);

    const result = await lookupWord("project", {
      getCached,
      fetchEn: vi.fn(),
      translateVi,
      saveCache,
    });

    expect(translateVi).toHaveBeenCalledWith("project");
    expect(result.meaningVi).toBe("dự án");
  });

  it("falls back to English gloss when LibreTranslate fails", async () => {
    const getCached = vi.fn().mockResolvedValue(null);
    const fetchEn = vi.fn().mockResolvedValue({
      word: "hello",
      phoneticIpa: "/həˈloʊ/",
      partOfSpeech: "noun",
      definitionEn: "A greeting.",
      exampleEn: "Hello!",
    });
    const translateVi = vi.fn().mockRejectedValue(new Error("LibreTranslate failed (403)"));
    const saveCache = vi.fn().mockImplementation(async (entry: DictionaryCacheEntry) => entry);

    const result = await lookupWord("hello", {
      getCached,
      fetchEn,
      translateVi,
      saveCache,
    });

    expect(result.meaningVi).toBe("A greeting.");
    expect(result.source).toBe("dictionaryapi");
  });

  it("returns a clear not-found error when the dictionary has no entry", async () => {
    const getCached = vi.fn().mockResolvedValue(null);
    const fetchEn = vi.fn().mockRejectedValue(new Error("Word not found"));
    const translateVi = vi.fn();
    const saveCache = vi.fn();

    await expect(
      lookupWord("xyzzy", { getCached, fetchEn, translateVi, saveCache }),
    ).rejects.toThrow(NOT_FOUND_LOOKUP_ERROR);
  });

  it("returns a clear network error when APIs fail and nothing is cached", async () => {
    const getCached = vi.fn().mockResolvedValue(null);
    const fetchEn = vi.fn().mockRejectedValue(new Error("offline"));
    const translateVi = vi.fn();
    const saveCache = vi.fn();

    await expect(
      lookupWord("hello", { getCached, fetchEn, translateVi, saveCache }),
    ).rejects.toThrow(NETWORK_LOOKUP_ERROR);
  });

  it("rejects blank input before touching cache or network", async () => {
    const deps = {
      getCached: vi.fn(),
      fetchEn: vi.fn(),
      translateVi: vi.fn(),
      saveCache: vi.fn(),
    };
    await expect(lookupWord("   ", deps)).rejects.toThrow(/empty/i);
    expect(deps.getCached).not.toHaveBeenCalled();
  });

  it("refetches the dictionary entry when cache has no example sentence", async () => {
    const getCached = vi.fn().mockResolvedValue(cached({ exampleEn: null }));
    const fetchEn = vi.fn().mockResolvedValue({
      word: "hello",
      phoneticIpa: "/həˈloʊ/",
      partOfSpeech: "noun",
      definitionEn: "A greeting.",
      exampleEn: "Hello, how are you?",
    });
    const translateVi = vi.fn();
    const saveCache = vi.fn().mockImplementation(async (entry: DictionaryCacheEntry) => entry);

    const result = await lookupWord("hello", {
      getCached,
      fetchEn,
      translateVi,
      saveCache,
    });

    expect(fetchEn).toHaveBeenCalledWith("hello");
    expect(result.exampleEn).toBe("Hello, how are you?");
    expect(translateVi).not.toHaveBeenCalled();
  });
});
