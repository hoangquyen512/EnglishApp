import { describe, expect, it } from "vitest";
import { canNotify, intervalMsFromMinutes } from "./index";

describe("scheduler interval", () => {
  it("converts minutes to ms and falls back to the demo default", () => {
    expect(intervalMsFromMinutes(2)).toBe(120_000);
    expect(intervalMsFromMinutes(0)).toBe(120_000);
  });

  it("does not notify when logged out", () => {
    expect(canNotify(false)).toBe(false);
    expect(canNotify(true)).toBe(true);
  });
});
