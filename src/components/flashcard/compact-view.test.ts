import { describe, expect, it } from "vitest";
import { compactFlashcardView } from "./compact-view";

describe("compactFlashcardView", () => {
  it("keeps the illustration and shows English plus Vietnamese on communication cards", () => {
    for (const contentType of ["phrase", "conversation"] as const) {
      expect(compactFlashcardView({ contentType })).toEqual({
        showIllustration: true,
        showPhonetic: false,
        showPartOfSpeech: false,
        showExample: false,
        showExampleVi: false,
      });
    }
  });

  it("keeps the full compact vocab layout", () => {
    expect(compactFlashcardView({ contentType: "vocabulary" })).toEqual({
      showIllustration: true,
      showPhonetic: true,
      showPartOfSpeech: true,
      showExample: true,
      showExampleVi: true,
    });
  });
});
