/** Dedicated demo story covers under public/covers/stories/. */
const DEMO_COVER_BY_KEY: Record<string, string> = {
  "a-new-friend": "/covers/stories/a-new-friend.png",
  "the-lost-star": "/covers/stories/the-lost-star.png",
  "milo-and-the-moon": "/covers/stories/milo-and-the-moon.png",
  "a-day-at-the-park": "/covers/stories/a-day-at-the-park.png",
  "the-brave-little-bird": "/covers/stories/the-brave-little-bird.png",
  "soras-secret-garden": "/covers/stories/soras-secret-garden.png",
};

export const FALLBACK_STORY_COVER = "/covers/stories/a-new-friend.png";
const LEGACY_COVER_PREFIX = "/covers/stories/";

export function demoStoryCoverUrl(coverKey: string): string {
  return DEMO_COVER_BY_KEY[coverKey] ?? FALLBACK_STORY_COVER;
}

/** Broken seed paths pointed at missing .webp files before dedicated PNG covers shipped. */
export function isLegacyStoryCoverUrl(coverUrl: string): boolean {
  return coverUrl.startsWith(LEGACY_COVER_PREFIX) && coverUrl.endsWith(".webp");
}

/** Slug → cover URL for repairing seeded INTERNAL_DEMO rows. */
export function demoStoryCoverRepairsBySlug(): Array<{ slug: string; coverUrl: string }> {
  return [
    { slug: "a-new-friend", coverUrl: demoStoryCoverUrl("a-new-friend") },
    { slug: "the-lost-star", coverUrl: demoStoryCoverUrl("the-lost-star") },
    { slug: "milo-and-the-moon", coverUrl: demoStoryCoverUrl("milo-and-the-moon") },
    { slug: "a-day-at-the-park", coverUrl: demoStoryCoverUrl("a-day-at-the-park") },
    { slug: "the-brave-little-bird", coverUrl: demoStoryCoverUrl("the-brave-little-bird") },
    { slug: "soras-secret-garden", coverUrl: demoStoryCoverUrl("soras-secret-garden") },
  ];
}
