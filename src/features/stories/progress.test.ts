import { describe, expect, it } from "vitest";
import {
  isChapterNearComplete,
  storyProgressLabel,
  storyProgressRatio,
} from "./progress";

describe("storyProgressRatio", () => {
  it("counts completed chapters plus current fraction", () => {
    // 2 done + 0.2 into chapter 3 of 12 → (2.2)/12
    expect(storyProgressRatio(2, 0.2, 12)).toBeCloseTo(2.2 / 12);
  });
});

describe("storyProgressLabel", () => {
  it("floors completed for X/Y display", () => {
    expect(storyProgressLabel(2, 12)).toEqual({
      read: 2,
      total: 12,
      labelFraction: "2/12",
    });
  });
});

describe("isChapterNearComplete", () => {
  it("is true at 90%+", () => {
    expect(isChapterNearComplete(89)).toBe(false);
    expect(isChapterNearComplete(90)).toBe(true);
  });
});
