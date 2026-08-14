import { describe, expect, it } from "vitest";
import {
  applyLevelCadence,
  applyMood,
  buildLlmContext,
  localToday,
  shouldCreateCheckin,
} from "./rules";

describe("shouldCreateCheckin", () => {
  it("creates when no check-in today and user has not chatted", () => {
    expect(
      shouldCreateCheckin({
        lastCheckinOn: null,
        today: "2026-08-13",
        userChattedToday: false,
      }),
    ).toBe(true);
  });

  it("skips if the user already sent a chat message today", () => {
    expect(
      shouldCreateCheckin({
        lastCheckinOn: null,
        today: "2026-08-13",
        userChattedToday: true,
      }),
    ).toBe(false);
  });

  it("never creates two check-ins on the same local day", () => {
    expect(
      shouldCreateCheckin({
        lastCheckinOn: "2026-08-13",
        today: "2026-08-13",
        userChattedToday: false,
      }),
    ).toBe(false);
  });

  it("creates again on a new local day if they have not chatted yet", () => {
    expect(
      shouldCreateCheckin({
        lastCheckinOn: "2026-08-12",
        today: "2026-08-13",
        userChattedToday: false,
      }),
    ).toBe(true);
  });
});

describe("applyMood", () => {
  it("updates when the utterance has a signal", () => {
    expect(
      applyMood(
        { mood: "ok", moodNote: "fine" },
        { mood: "down", moodNote: "tired after work" },
      ),
    ).toEqual({ mood: "down", moodNote: "tired after work" });
  });

  it("keeps the previous mood when there is no signal", () => {
    expect(applyMood({ mood: "up", moodNote: "got the job" }, null)).toEqual({
      mood: "up",
      moodNote: "got the job",
    });
  });

  it("keeps the previous mood when signal is unknown without a note", () => {
    expect(
      applyMood({ mood: "ok", moodNote: "steady" }, { mood: "unknown" }),
    ).toEqual({ mood: "ok", moodNote: "steady" });
  });
});

describe("applyLevelCadence", () => {
  it("does not change level after a single suggestion", () => {
    expect(
      applyLevelCadence({
        level: "beginner",
        pendingDirection: null,
        suggestion: "up",
      }),
    ).toEqual({ level: "beginner", pendingDirection: "up" });
  });

  it("raises level after two agreeing up passes", () => {
    expect(
      applyLevelCadence({
        level: "beginner",
        pendingDirection: "up",
        suggestion: "up",
      }),
    ).toEqual({ level: "intermediate", pendingDirection: null });
  });

  it("lowers level after two agreeing down passes", () => {
    expect(
      applyLevelCadence({
        level: "intermediate",
        pendingDirection: "down",
        suggestion: "down",
      }),
    ).toEqual({ level: "beginner", pendingDirection: null });
  });

  it("does not go past advanced or below beginner", () => {
    expect(
      applyLevelCadence({
        level: "advanced",
        pendingDirection: "up",
        suggestion: "up",
      }),
    ).toEqual({ level: "advanced", pendingDirection: null });
  });

  it("replaces pending when the new suggestion disagrees", () => {
    expect(
      applyLevelCadence({
        level: "beginner",
        pendingDirection: "up",
        suggestion: "down",
      }),
    ).toEqual({ level: "beginner", pendingDirection: "down" });
  });

  it("ignores keep for a level change", () => {
    expect(
      applyLevelCadence({
        level: "beginner",
        pendingDirection: "up",
        suggestion: "keep",
      }),
    ).toEqual({ level: "beginner", pendingDirection: "keep" });
  });
});

describe("buildLlmContext", () => {
  it("sends summary plus the last 10 messages, not the full transcript", () => {
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? ("companion" as const) : ("user" as const),
      body: `m${i}`,
    }));
    const ctx = buildLlmContext({
      memorySummary: "talks about work",
      history: messages,
      currentUserMessage: "I am tired",
    });
    expect(ctx.memorySummary).toBe("talks about work");
    expect(ctx.recent).toHaveLength(10);
    expect(ctx.recent[0]?.body).toBe("m10");
    expect(ctx.recent[ctx.recent.length - 1]?.body).toBe("m19");
    expect(ctx.currentUserMessage).toBe("I am tired");
    expect(ctx.recent.some((m) => m.body === "m0")).toBe(false);
  });
});

describe("localToday", () => {
  it("formats the calendar date in the user timezone", () => {
    const instant = new Date("2026-08-13T17:00:00.000Z");
    expect(localToday(instant, "Asia/Ho_Chi_Minh")).toBe("2026-08-14");
    expect(localToday(instant, "UTC")).toBe("2026-08-13");
  });
});
