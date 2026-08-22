import { describe, expect, it } from "vitest";
import {
  chapterCompletedAt,
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

describe("chapterCompletedAt", () => {
  it("marks a chapter complete when scroll progress reaches 90%", () => {
    const now = "2026-08-22T03:30:00.000Z";

    expect(chapterCompletedAt(89, null, now)).toBeNull();
    expect(chapterCompletedAt(90, null, now)).toBe(now);
  });

  it("keeps the original completion time after the reader scrolls upward", () => {
    expect(
      chapterCompletedAt(
        40,
        "2026-08-22T03:00:00.000Z",
        "2026-08-22T03:30:00.000Z",
      ),
    ).toBe("2026-08-22T03:00:00.000Z");
  });
});
