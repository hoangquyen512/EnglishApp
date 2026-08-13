import { describe, expect, it } from "vitest";
import { applyReview, nextIntervalDays, nextStatus } from "./spaced-repetition";

describe("spaced repetition", () => {
  it("resets the interval after a wrong answer", () => {
    expect(nextIntervalDays(4, false)).toBe(0);
    expect(nextStatus(0, false)).toBe("new");
  });

  it("grows the interval and marks mastered after enough correct answers", () => {
    expect(nextIntervalDays(1, true)).toBe(1);
    expect(nextIntervalDays(3, true)).toBe(3);
    expect(nextIntervalDays(4, true)).toBe(7);
    expect(nextStatus(5, true)).toBe("mastered");
    const result = applyReview({ correctCount: 4, wrongCount: 1, wasCorrect: true });
    expect(result.correctCount).toBe(5);
    expect(result.status).toBe("mastered");
  });
});
