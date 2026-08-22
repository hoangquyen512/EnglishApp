import { describe, expect, it } from "vitest";
import { cycleIndex, formatCompanionTime, homeRightPanel } from "./home-panel";

describe("homeRightPanel", () => {
  it("defaults to story when no sidebar action is selected", () => {
    expect(homeRightPanel(null)).toBe("story");
  });

  it("keeps the selected sidebar action", () => {
    expect(homeRightPanel("chat")).toBe("chat");
    expect(homeRightPanel("lookup")).toBe("lookup");
    expect(homeRightPanel("story")).toBe("story");
  });
});

describe("cycleIndex", () => {
  it("wraps forward and backward", () => {
    expect(cycleIndex(2, 1, 10)).toBe(3);
    expect(cycleIndex(9, 1, 10)).toBe(0);
    expect(cycleIndex(0, -1, 10)).toBe(9);
  });

  it("returns 0 for empty length", () => {
    expect(cycleIndex(3, 1, 0)).toBe(0);
  });
});

describe("formatCompanionTime", () => {
  it("formats ISO timestamps as 12-hour clock in Asia/Ho_Chi_Minh", () => {
    // 2026-08-21T15:21:00.000Z = 22:21 in UTC+7
    expect(formatCompanionTime("2026-08-21T15:21:00.000Z")).toBe("10:21 PM");
  });

  it("returns empty string for invalid input", () => {
    expect(formatCompanionTime("not-a-date")).toBe("");
  });
});
