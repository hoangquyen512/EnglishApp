import { describe, expect, it } from "vitest";
import { A_NEW_FRIEND_CH1 } from "../../data/stories/a-new-friend-ch1";
import { DEMO_STORIES } from "../../data/stories/demo-catalog";
import { buildDemoSeedPlan } from "./seed";

describe("DEMO_STORIES", () => {
  it("lists six library stories", () => {
    expect(DEMO_STORIES).toHaveLength(6);
    expect(DEMO_STORIES.map((s) => s.slug)).toEqual([
      "a-new-friend",
      "the-lost-star",
      "milo-and-the-moon",
      "a-day-at-the-park",
      "the-brave-little-bird",
      "soras-secret-garden",
    ]);
  });
});

describe("A_NEW_FRIEND_CH1", () => {
  it("has featured lemmas quiet, forest, soft, fly, den", () => {
    expect(A_NEW_FRIEND_CH1.featured.map((v) => v.lemma)).toEqual([
      "quiet",
      "forest",
      "soft",
      "fly",
      "den",
    ]);
  });
});

describe("buildDemoSeedPlan", () => {
  it("builds six stories with A New Friend chapter 1 content", () => {
    const plan = buildDemoSeedPlan();

    expect(plan.sourceType).toBe("INTERNAL_DEMO");
    expect(plan.stories).toHaveLength(6);

    const aNewFriend = plan.stories.find((s) => s.slug === "a-new-friend");
    expect(aNewFriend).toBeDefined();
    expect(aNewFriend!.chapters).toHaveLength(12);
    expect(aNewFriend!.genre).toBe("children");
    expect(aNewFriend!.cefrLevel).toBe("A1");
    expect(aNewFriend!.chapterCount).toBe(12);
    expect(aNewFriend!.estimatedReadMinutes).toBe(20);

    const ch1 = aNewFriend!.chapters.find((c) => c.chapterNo === 1);
    expect(ch1).toBeDefined();
    expect(ch1!.units.length).toBeGreaterThanOrEqual(3);
    expect(ch1!.featured.map((v) => v.lemma)).toEqual([
      "quiet",
      "forest",
      "soft",
      "fly",
      "den",
    ]);
  });

  it("assigns stable story and chapter ids", () => {
    const plan = buildDemoSeedPlan();
    expect(plan.stories.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6]);

    const aNewFriend = plan.stories[0]!;
    expect(aNewFriend.chapters.map((c) => c.id)).toEqual([
      101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
    ]);
  });

  it("gives every story at least one readable chapter", () => {
    const plan = buildDemoSeedPlan();
    for (const story of plan.stories) {
      expect(story.chapters.length).toBeGreaterThan(0);
      const first = story.chapters[0]!;
      expect(first.units.length).toBeGreaterThanOrEqual(1);
    }
  });
});
