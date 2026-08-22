import { describe, expect, it } from "vitest";
import { PHASE1_VOCABULARY } from "./phase1";
import { isPlaceholderVocabWord, usableVocabMeaning } from "./quality";
import { resolveVocabUsage } from "./usage";

describe("resolveVocabUsage", () => {
  it("replaces a mnemonic example with the TOEIC usage sentence", () => {
    expect(
      resolveVocabUsage({
        word: "promptly",
        phonetic: "/·/",
        example: 'Please remember the word "promptly" in office_work context.',
        exampleVi: 'Hãy nhớ từ "promptly" trong ngữ cảnh office_work.',
      }),
    ).toEqual({
      phonetic: "/pɹˈɑmptli/",
      meaning: "ngay lập tức / đúng giờ",
      example: "Please reply promptly to the client's email.",
      exampleVi: "Vui lòng trả lời email khách hàng ngay.",
    });
  });

  it("fills Vietnamese meaning from TOEIC when the lexicon meaning is just the English word", () => {
    expect(
      resolveVocabUsage({
        word: "promptly",
        meaning: "promptly",
        example: 'Please remember the word "promptly" in office_work context.',
      }).meaning,
    ).toBe("ngay lập tức / đúng giờ");
  });

  it("uses a conversation sentence when TOEIC has no example", () => {
    const usage = resolveVocabUsage({
      word: "week",
      phonetic: "/·/",
      meaning: "week",
      example: 'Please remember the word "week" in office_work context.',
      exampleVi: 'Hãy nhớ từ "week" trong ngữ cảnh office_work.',
    });
    expect(usage.example?.toLowerCase()).toContain("week");
    expect(usage.example).not.toMatch(/please remember/i);
    expect(usage.exampleVi).toBeTruthy();
    expect(usage.exampleVi).not.toMatch(/hãy nhớ từ/i);
  });

  it("translates pork instead of repeating the English word", () => {
    const usage = resolveVocabUsage({
      word: "pork",
      phonetic: "/·/",
      partOfSpeech: "n.",
      meaning: "pork",
      example: 'Please remember the word "pork" in food_dining context.',
      exampleVi: 'Hãy nhớ từ "pork" trong ngữ cảnh food_dining.',
    });
    expect(usage.meaning.toLowerCase()).not.toBe("pork");
    expect(usage.meaning).toMatch(/heo|lợn/);
  });

  it("fills Vietnamese meanings for food lemmas that echoed English", () => {
    const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
    for (const word of ["pork", "beef", "chicken", "shrimp", "fish", "tofu", "ribs"]) {
      const row = (PHASE1_VOCABULARY.food_dining ?? []).find((item) => item.word === word);
      expect(row, word).toBeTruthy();
      expect(usableVocabMeaning(row!.word, row!.meaning)).toBeNull();
      const usage = resolveVocabUsage(row!);
      expect(usage.meaning.toLowerCase(), word).not.toBe(word);
      expect(usage.meaning, word).toMatch(VI);
    }
  });

  it("keeps the meanings-table gloss short on the card", () => {
    expect(resolveVocabUsage({ word: "air", meaning: "air" }).meaning).toBe("không khí");
  });

  it("hides placeholder examples when meaning is only the English word", () => {
    expect(
      resolveVocabUsage({
        word: "zzzznotaword",
        example: 'Please remember the word "zzzznotaword" in family context.',
        exampleVi: 'Hãy nhớ từ "zzzznotaword" trong ngữ cảnh family.',
      }),
    ).toEqual({
      phonetic: null,
      meaning: "zzzznotaword",
      example: null,
      exampleVi: null,
    });
  });

  it("fills inherit with IPA and a Vietnamese usage sentence", () => {
    const usage = resolveVocabUsage({
      word: "inherit",
      phonetic: "/·/",
      partOfSpeech: "v.",
      meaning: "thừa kế",
      example: 'Please remember the word "inherit" in family context.',
      exampleVi: 'Hãy nhớ từ "inherit" trong ngữ cảnh family.',
    });
    expect(usage.phonetic).toMatch(/^\/.+\//);
    expect(usage.example?.toLowerCase()).toContain("inherit");
    expect(usage.example).not.toMatch(/please remember/i);
    expect(usage.exampleVi).toContain("thừa kế");
    expect(usage.meaning).toBe("thừa kế");
  });

  it("fills toddler IPA instead of hiding the dummy placeholder", () => {
    const row = (PHASE1_VOCABULARY.family ?? []).find((item) => item.word === "toddler");
    expect(row).toBeTruthy();
    expect(row!.phonetic).toMatch(/^\/\s*·\s*\/$/);
    const usage = resolveVocabUsage(row!);
    expect(usage.phonetic).toMatch(/^\/.+\//);
    expect(usage.phonetic).not.toMatch(/·/);
  });

  it("gives a usage example to every real family lemma with Vietnamese meaning", () => {
    const rows = (PHASE1_VOCABULARY.family ?? []).filter(
      (row) => !isPlaceholderVocabWord(row.word) && usableVocabMeaning(row.word, row.meaning),
    );
    expect(rows.length).toBeGreaterThan(10);
    expect(rows.some((row) => row.word === "inherit")).toBe(true);
    for (const row of rows) {
      const usage = resolveVocabUsage(row);
      expect(usage.example, row.word).toBeTruthy();
      expect(usage.example).not.toMatch(/please remember/i);
      expect(usage.exampleVi, row.word).toBeTruthy();
    }
  });
});
