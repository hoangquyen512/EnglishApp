import { describe, expect, it } from "vitest";
import { PHASE1_VOCABULARY } from "./phase1";
import { isPlaceholderVocabWord, isPlaceholderVocabExample, usableVocabPhonetic, usableVocabExample, usableVocabMeaning } from "./quality";

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

  it("rejects mnemonic placeholder examples", () => {
    expect(
      isPlaceholderVocabExample('Please remember the word "promptly" in office_work context.'),
    ).toBe(true);
    expect(isPlaceholderVocabExample('Hãy nhớ từ "promptly" trong ngữ cảnh office_work.')).toBe(
      true,
    );
    expect(usableVocabExample('Please remember the word "deadline" in travel context.')).toBeNull();
  });

  it("keeps real usage examples", () => {
    expect(isPlaceholderVocabExample("Please reply promptly to the client's email.")).toBe(false);
    expect(usableVocabExample("Please reply promptly to the client's email.")).toBe(
      "Please reply promptly to the client's email.",
    );
  });

  it("treats an English echo as a missing Vietnamese meaning", () => {
    expect(usableVocabMeaning("week", "week")).toBeNull();
    expect(usableVocabMeaning("promptly", "ngay lập tức / đúng giờ")).toBe(
      "ngay lập tức / đúng giờ",
    );
  });

  it("still has real words after dropping placeholders", () => {
    const real = (PHASE1_VOCABULARY.family ?? []).filter((row) => !isPlaceholderVocabWord(row.word));
    expect(real.map((row) => row.word)).toContain("niece");
    expect(real.length).toBeGreaterThan(20);
    expect(real.some((row) => isPlaceholderVocabWord(row.word))).toBe(false);
  });
});
