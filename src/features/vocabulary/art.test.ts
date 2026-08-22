import { describe, expect, it } from "vitest";
import { resolveVocabArt } from "./art";

describe("vocabulary art", () => {
  it("keeps TOEIC art keys that have jpg files", () => {
    expect(resolveVocabArt({ imageKey: "invoice", word: "invoice", topic: "office_work" })).toBe(
      "/arts/invoice.jpg",
    );
  });

  it("uses the example sentence to pick a matching scene", () => {
    expect(
      resolveVocabArt({
        imageKey: "small",
        word: "small",
        topic: "food_dining",
        example: "I would like a small iced latte.",
      }),
    ).toBe("/illustrations/cafe-1.jpg");
  });

  it("maps food topics onto cafe illustrations via keywords", () => {
    expect(resolveVocabArt({ imageKey: "menu", word: "menu", topic: "food_dining" })).toMatch(
      /^\/illustrations\/cafe-[1-8]\.jpg$/,
    );
    expect(
      resolveVocabArt({
        imageKey: "passport",
        word: "passport",
        topic: "travel",
        example: "May I see your passport, please?",
      }),
    ).toMatch(/^\/illustrations\/air-[1-8]\.jpg$/);
  });
});
