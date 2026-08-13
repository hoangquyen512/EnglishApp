import { describe, expect, it } from "vitest";
import {
  CARD_INTERVAL_MS,
  cardProgress,
  cardRemainingMs,
  shouldAdvanceCard,
} from "./timer";

describe("TOEIC flashcard timer", () => {
  it("uses a 30 second interval", () => {
    expect(CARD_INTERVAL_MS).toBe(30_000);
  });

  it("counts down while playing and freezes while paused", () => {
    expect(
      cardRemainingMs({
        startedAt: 1_000,
        now: 4_000,
        pausedMs: 0,
        pausedAt: null,
      }),
    ).toBe(27_000);

    expect(
      cardRemainingMs({
        startedAt: 1_000,
        now: 9_000,
        pausedMs: 0,
        pausedAt: 4_000,
      }),
    ).toBe(27_000);
  });

  it("advances only after the interval elapses", () => {
    expect(shouldAdvanceCard(1)).toBe(false);
    expect(shouldAdvanceCard(0)).toBe(true);
    expect(cardProgress(7_500)).toBe(0.75);
    expect(cardProgress(0)).toBe(1);
    expect(cardProgress(30_000)).toBe(0);
  });
});
