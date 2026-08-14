import { describe, expect, it } from "vitest";
import { shouldSpeakOnCard, shouldTickAdvance } from "./companion-study";

describe("companion study gates", () => {
  it("does not speak when inactive", () => {
    expect(shouldSpeakOnCard({ autoSpeak: true, active: false })).toBe(false);
    expect(shouldSpeakOnCard({ autoSpeak: true, active: true })).toBe(true);
    expect(shouldSpeakOnCard({ autoSpeak: false, active: true })).toBe(false);
  });

  it("does not advance when inactive even if timer elapsed", () => {
    expect(shouldTickAdvance({ active: false, paused: false, remainingMs: 0 })).toBe(false);
    expect(shouldTickAdvance({ active: true, paused: true, remainingMs: 0 })).toBe(false);
    expect(shouldTickAdvance({ active: true, paused: false, remainingMs: 0 })).toBe(true);
    expect(shouldTickAdvance({ active: true, paused: false, remainingMs: 1000 })).toBe(false);
  });
});
