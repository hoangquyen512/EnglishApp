import { describe, expect, it } from "vitest";
import { nextDeckIndex, previousDeckIndex, shuffle } from "./deck";
import { TOEIC_CARDS } from "../../data/toeic-cards";
import { ttsConfig } from "./speech";
import { countsTowardMastery, xpForOutcome } from "./outcome";

describe("flashcard deck", () => {
  it("rotates forward and wraps around", () => {
    expect(nextDeckIndex(0, 3)).toBe(1);
    expect(nextDeckIndex(2, 3)).toBe(0);
    expect(previousDeckIndex(0, 3)).toBe(2);
  });

  it("shuffles without dropping items", () => {
    expect(shuffle([1, 2, 3], () => 0).sort()).toEqual([1, 2, 3]);
  });
});

describe("TOEIC card content", () => {
  it("includes word, IPA, image, example, and meaning on every card", () => {
    expect(TOEIC_CARDS.length).toBeGreaterThanOrEqual(12);
    for (const card of TOEIC_CARDS) {
      expect(card.word.length).toBeGreaterThan(0);
      expect(card.phonetic).toMatch(/^\/.+\/$/);
      expect(card.meaning.length).toBeGreaterThan(0);
      expect(card.example.length).toBeGreaterThan(0);
      expect(card.imageKey.length).toBeGreaterThan(0);
      expect(card.partOfSpeech.length).toBeGreaterThan(0);
    }
  });
});

describe("pronunciation", () => {
  it("reads the English lemma with a US voice", () => {
    expect(ttsConfig("invoice")).toEqual({
      text: "invoice",
      lang: "en-US",
      rate: 0.9,
      pitch: 1,
    });
  });
});

describe("study outcomes", () => {
  it("gives XP for viewing or marking known, not for unknown", () => {
    expect(xpForOutcome("viewed")).toBe(2);
    expect(xpForOutcome("known")).toBe(5);
    expect(xpForOutcome("unknown")).toBe(0);
    expect(countsTowardMastery("viewed")).toBe(false);
    expect(countsTowardMastery("known")).toBe(true);
    expect(countsTowardMastery("unknown")).toBe(false);
  });
});
