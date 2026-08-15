import { describe, expect, it } from "vitest";
import {
  COMPANION_COLLAPSED_SIZE,
  COMPANION_EXPANDED_SIZE,
  companionBounds,
} from "./window-geometry";

describe("companionBounds", () => {
  it("expands left while keeping the right edge fixed", () => {
    const current = { expanded: false, x: 800, y: 200, width: 120, height: 120 };
    const next = companionBounds({ ...current, expanded: true });
    expect(next).toEqual({
      x: 800 + 120 - COMPANION_EXPANDED_SIZE.width,
      y: 200,
      width: COMPANION_EXPANDED_SIZE.width,
      height: COMPANION_EXPANDED_SIZE.height,
    });
    expect(next.x + next.width).toBe(current.x + current.width);
  });

  it("collapses toward the right edge without moving y", () => {
    const current = {
      expanded: true,
      x: 500,
      y: 90,
      width: COMPANION_EXPANDED_SIZE.width,
      height: COMPANION_EXPANDED_SIZE.height,
    };
    const next = companionBounds({ ...current, expanded: false });
    expect(next).toEqual({
      x: 500 + COMPANION_EXPANDED_SIZE.width - COMPANION_COLLAPSED_SIZE.width,
      y: 90,
      width: COMPANION_COLLAPSED_SIZE.width,
      height: COMPANION_COLLAPSED_SIZE.height,
    });
    expect(next.x + next.width).toBe(current.x + current.width);
  });
});
