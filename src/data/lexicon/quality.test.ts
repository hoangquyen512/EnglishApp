import { describe, expect, it } from "vitest";
import { PHASE1_VOCABULARY } from "./phase1";
import { isPlaceholderVocabWord, usableVocabPhonetic } from "./quality";

describe("phase-1 vocabulary quality", () => {
  it("rejects padded slug words like niece-term-515", () => {
    expect(isPlaceholderVocabWord("niece-term-515")).toBe(true);
    expect(isPlaceholderVocabWord("airport-term-1")).toBe(true);
    expect(isPlaceholderVocabWord("itemfamily42")).toBe(true);
  });

  it("keeps real lemmas", () => {
    expect(isPlaceholderVocabWord("niece")).toBe(false);
    expect(isPlaceholderVocabWord("long-term")).toBe(false);
    expect(isPlaceholderVocabWord("sister")).toBe(false);
  });

  it("hides dummy IPA placeholders", () => {
    expect(usableVocabPhonetic("/·/")).toBeNull();
    expect(usableVocabPhonetic("/ · /")).toBeNull();
    expect(usableVocabPhonetic("/niːs/")).toBe("/niːs/");
  });

  it("still has real words after dropping placeholders", () => {
    const real = (PHASE1_VOCABULARY.family ?? []).filter((row) => !isPlaceholderVocabWord(row.word));
    expect(real.map((row) => row.word)).toContain("niece");
    expect(real.length).toBeGreaterThan(20);
    expect(real.some((row) => isPlaceholderVocabWord(row.word))).toBe(false);
  });
});
