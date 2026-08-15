import { describe, expect, it } from "vitest";
import { applyXpGain } from "./xp";
import { moodFromLastFed } from "./mood";
import { missionCountsToward } from "./missions";
import { nextStreakOnStudy, streakAfterIdle } from "./streak";

describe("xp and level", () => {
  it("levels up when XP fills a level", () => {
    const result = applyXpGain({ level: 1, xp: 48 }, 5);
    expect(result.level).toBe(2);
    expect(result.xp).toBe(3);
    expect(result.leveledUp).toBe(true);
  });
});

describe("mood decay", () => {
  it("moves happy → hungry across idle days and never dies", () => {
    const now = Date.parse("2026-08-13T00:00:00.000Z");
    expect(moodFromLastFed("2026-08-13T00:00:00.000Z", now)).toBe("happy");
    expect(moodFromLastFed("2026-08-12T00:00:00.000Z", now)).toBe("neutral");
    expect(moodFromLastFed("2026-08-11T00:00:00.000Z", now)).toBe("sad");
    expect(moodFromLastFed("2026-08-01T00:00:00.000Z", now)).toBe("hungry");
  });
});

describe("streak", () => {
  it("increments after studying yesterday, resets after a gap", () => {
    expect(nextStreakOnStudy(3, "2026-08-12", "2026-08-13", "2026-08-12")).toBe(4);
    expect(nextStreakOnStudy(3, "2026-08-10", "2026-08-13", "2026-08-12")).toBe(1);
    expect(streakAfterIdle(5, "2026-08-10", "2026-08-13", "2026-08-12")).toBe(0);
  });
});

describe("missions", () => {
  it("counts new items, wrong reviews, and topic practice separately", () => {
    expect(
      missionCountsToward("learn_new", {
        isNew: true,
        hadWrong: false,
        isCorrect: false,
        contentType: "vocabulary",
        topic: null,
      }, null),
    ).toBe(true);
    expect(
      missionCountsToward("review_wrong", {
        isNew: false,
        hadWrong: true,
        isCorrect: true,
        contentType: "phrase",
        topic: "food_dining",
      }, null),
    ).toBe(true);
    expect(
      missionCountsToward(
        "topic_practice",
        {
          isNew: false,
          hadWrong: false,
          isCorrect: true,
          contentType: "phrase",
          topic: "travel",
        },
        "travel",
      ),
    ).toBe(true);
    expect(
      missionCountsToward(
        "topic_practice",
        {
          isNew: false,
          hadWrong: false,
          isCorrect: true,
          contentType: "vocabulary",
          topic: "travel",
        },
        "travel",
      ),
    ).toBe(true);
    expect(
      missionCountsToward(
        "topic_practice",
        {
          isNew: false,
          hadWrong: false,
          isCorrect: true,
          contentType: "phrase",
          topic: "food_dining",
        },
        "travel",
      ),
    ).toBe(false);
  });
});
