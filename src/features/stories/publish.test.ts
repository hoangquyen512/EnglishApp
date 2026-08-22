import { describe, expect, it } from "vitest";
import { canPublishStory } from "./publish";

describe("canPublishStory", () => {
  it("allows published + PUBLIC_DOMAIN", () => {
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "PUBLIC_DOMAIN",
        sourceType: "GUTENBERG",
      }),
    ).toBe(true);
  });

  it("denies PENDING_REVIEW and BLOCKED", () => {
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "PENDING_REVIEW",
        sourceType: "STORYWEAVER",
      }),
    ).toBe(false);
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "BLOCKED",
        sourceType: "STORYWEAVER",
      }),
    ).toBe(false);
  });

  it("allows INTERNAL_DEMO when published even if LICENSED", () => {
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "LICENSED",
        sourceType: "INTERNAL_DEMO",
      }),
    ).toBe(true);
  });

  it("denies draft", () => {
    expect(
      canPublishStory({
        status: "draft",
        rightsStatus: "CC_BY",
        sourceType: "STORYWEAVER",
      }),
    ).toBe(false);
  });
});
