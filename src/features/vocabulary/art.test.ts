import { describe, expect, it } from "vitest";
import { resolveVocabArt } from "./art";

describe("vocabulary art", () => {
  it("keeps TOEIC art keys that have jpg files", () => {
    expect(resolveVocabArt({ imageKey: "invoice", word: "invoice", topic: "office_work" })).toBe(
      "/arts/invoice.jpg",
    );
  });

  it("falls back to topic illustrations instead of missing arts files", () => {
    expect(resolveVocabArt({ imageKey: "niece-term-515", word: "niece-term-515", topic: "family" })).toBe(
      "/illustrations/fam-2.jpg",
    );
    expect(resolveVocabArt({ imageKey: "sister", word: "sister", topic: "family" })).toMatch(
      /^\/illustrations\/fam-[1-8]\.jpg$/,
    );
  });

  it("maps food and travel topics onto existing banks", () => {
    expect(resolveVocabArt({ imageKey: "menu", word: "menu", topic: "food_dining" })).toMatch(
      /^\/illustrations\/cafe-[1-8]\.jpg$/,
    );
    expect(resolveVocabArt({ imageKey: "passport", word: "passport", topic: "travel" })).toMatch(
      /^\/illustrations\/air-[1-8]\.jpg$/,
    );
  });
});
