import { describe, expect, it } from "vitest";
import { intervalMsFromMinutes } from "./index";

describe("scheduler interval", () => {
  it("converts minutes to ms and falls back to the demo default", () => {
    expect(intervalMsFromMinutes(2)).toBe(120_000);
    expect(intervalMsFromMinutes(0)).toBe(120_000);
  });
});
