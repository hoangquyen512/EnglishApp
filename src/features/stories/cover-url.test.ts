import { describe, expect, it } from "vitest";
import {
  demoStoryCoverRepairsBySlug,
  demoStoryCoverUrl,
  isLegacyStoryCoverUrl,
} from "./cover-url";

describe("demoStoryCoverUrl", () => {
  it("maps demo keys to dedicated story cover PNGs", () => {
    expect(demoStoryCoverUrl("a-new-friend")).toBe("/covers/stories/a-new-friend.png");
    expect(demoStoryCoverUrl("unknown")).toBe("/covers/stories/a-new-friend.png");
  });

  it("flags legacy webp cover paths only", () => {
    expect(isLegacyStoryCoverUrl("/covers/stories/a-new-friend.webp")).toBe(true);
    expect(isLegacyStoryCoverUrl("/covers/stories/a-new-friend.png")).toBe(false);
    expect(isLegacyStoryCoverUrl("/illustrations/fam-1.jpg")).toBe(false);
  });

  it("lists slug repairs for all six demo stories", () => {
    expect(demoStoryCoverRepairsBySlug()).toHaveLength(6);
    expect(demoStoryCoverRepairsBySlug()[0]?.coverUrl).toMatch(/^\/covers\/stories\//);
  });
});
