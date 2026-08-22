import type { DemoChapterDefinition } from "../types";
import { A_NEW_FRIEND_CHAPTERS } from "./a-new-friend";
import {
  A_DAY_AT_THE_PARK_CHAPTERS,
  MILO_AND_THE_MOON_CHAPTERS,
  SORAS_SECRET_GARDEN_CHAPTERS,
  THE_BRAVE_LITTLE_BIRD_CHAPTERS,
  THE_LOST_STAR_CHAPTERS,
} from "./other-stories";

const DEMO_CHAPTERS_BY_SLUG: Record<string, DemoChapterDefinition[]> = {
  "a-new-friend": A_NEW_FRIEND_CHAPTERS,
  "the-lost-star": THE_LOST_STAR_CHAPTERS,
  "milo-and-the-moon": MILO_AND_THE_MOON_CHAPTERS,
  "a-day-at-the-park": A_DAY_AT_THE_PARK_CHAPTERS,
  "the-brave-little-bird": THE_BRAVE_LITTLE_BIRD_CHAPTERS,
  "soras-secret-garden": SORAS_SECRET_GARDEN_CHAPTERS,
};

export function getDemoChaptersForStory(
  slug: string,
  chapterCount: number,
): DemoChapterDefinition[] {
  const chapters = DEMO_CHAPTERS_BY_SLUG[slug] ?? [];
  if (chapters.length === 0) return [];
  if (chapters.length >= chapterCount) return chapters.slice(0, chapterCount);
  return chapters;
}

export {
  A_NEW_FRIEND_CHAPTERS,
  A_DAY_AT_THE_PARK_CHAPTERS,
  MILO_AND_THE_MOON_CHAPTERS,
  SORAS_SECRET_GARDEN_CHAPTERS,
  THE_BRAVE_LITTLE_BIRD_CHAPTERS,
  THE_LOST_STAR_CHAPTERS,
};
