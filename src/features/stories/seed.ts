import { getDemoChaptersForStory } from "../../data/stories/content";
import { chapterHasPlaceholderContent } from "../../data/stories/placeholder";
import { DEMO_STORIES, type DemoStoryMeta } from "../../data/stories/demo-catalog";
import { demoStoryCoverUrl } from "./cover-url";
import type {
  ContentUnitType,
  DemoChapterUnit,
  FeaturedVocab,
} from "../../data/stories/types";
import type { CefrLevel, RightsStatus, StoryStatus } from "./types";

export type { DemoStoryMeta, FeaturedVocab, ContentUnitType };

export type DemoSeedUnit = {
  id: number;
  type: ContentUnitType;
  orderNo: number;
  enSentences: string[];
  viSentences: string[];
};

export type DemoSeedChapter = {
  id: number;
  storyId: number;
  chapterNo: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  estimatedReadMinutes: number;
  orderNo: number;
  units: DemoSeedUnit[];
  featured: FeaturedVocab[];
};

export type DemoSeedStory = {
  id: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  coverUrl: string;
  coverKey: string;
  cefrLevel: CefrLevel;
  genre: string;
  chapterCount: number;
  estimatedReadMinutes: number;
  popularScore: number;
  createdAt: string;
  status: StoryStatus;
  rightsStatus: RightsStatus;
  sourceType: "INTERNAL_DEMO";
  attributionRequired: boolean;
  attributionText: string;
  chapters: DemoSeedChapter[];
};

export type DemoSeedPlan = {
  sourceType: "INTERNAL_DEMO";
  sourceName: string;
  stories: DemoSeedStory[];
};

const ATTRIBUTION_TEXT =
  "INTERNAL_DEMO — authored for Yume development; not production-licensed third-party content.";

function chapterId(storyId: number, chapterNo: number): number {
  return storyId * 100 + chapterNo;
}

function unitId(chapterIdValue: number, orderNo: number): number {
  return chapterIdValue * 10 + orderNo;
}

function mapUnits(
  chapterIdValue: number,
  units: DemoChapterUnit[],
): DemoSeedUnit[] {
  return units.map((unit, index) => ({
    id: unitId(chapterIdValue, index + 1),
    type: unit.type,
    orderNo: index + 1,
    enSentences: unit.enSentences,
    viSentences: unit.viSentences,
  }));
}

function buildChapters(storyId: number, meta: DemoStoryMeta): DemoSeedChapter[] {
  const definitions = getDemoChaptersForStory(meta.slug, meta.chapterCount);
  return definitions.map((definition, index) => {
    const chapterNo = index + 1;
    const id = chapterId(storyId, chapterNo);
    return {
      id,
      storyId,
      chapterNo,
      slug: definition.slug,
      titleEn: definition.titleEn,
      titleVi: definition.titleVi,
      estimatedReadMinutes: chapterNo === 1 ? 3 : 2,
      orderNo: chapterNo,
      units: mapUnits(id, definition.units),
      featured: (definition.featured ?? []).map((item, featuredIndex) => ({
        ...item,
        orderNo: featuredIndex + 1,
      })),
    };
  });
}

export function buildDemoSeedPlan(): DemoSeedPlan {
  const stories: DemoSeedStory[] = DEMO_STORIES.map((meta, index) => {
    const id = index + 1;
    return {
      id,
      slug: meta.slug,
      titleEn: meta.titleEn,
      titleVi: meta.titleVi,
      descriptionEn: meta.descriptionEn,
      descriptionVi: meta.descriptionVi,
      coverUrl: demoStoryCoverUrl(meta.coverKey),
      coverKey: meta.coverKey,
      cefrLevel: meta.cefrLevel,
      genre: meta.genre,
      chapterCount: meta.chapterCount,
      estimatedReadMinutes: meta.estimatedReadMinutes,
      popularScore: meta.popularScore,
      createdAt: meta.createdAt,
      status: "published",
      rightsStatus: "LICENSED",
      sourceType: "INTERNAL_DEMO",
      attributionRequired: true,
      attributionText: ATTRIBUTION_TEXT,
      chapters: buildChapters(id, meta),
    };
  });

  return {
    sourceType: "INTERNAL_DEMO",
    sourceName: "Yume INTERNAL_DEMO Library",
    stories,
  };
}

export function findMissingDemoStories(existingSlugs: readonly string[]): DemoSeedStory[] {
  const existing = new Set(existingSlugs);
  return buildDemoSeedPlan().stories.filter((story) => !existing.has(story.slug));
}

export function demoChapterNeedsContentRepair(
  storedUnits: ReadonlyArray<{ enSentences: readonly string[] }>,
  canonicalUnits: ReadonlyArray<{ enSentences: readonly string[] }>,
): boolean {
  if (chapterHasPlaceholderContent(storedUnits)) return true;
  if (storedUnits.length !== canonicalUnits.length) return true;
  for (let index = 0; index < storedUnits.length; index += 1) {
    const stored = storedUnits[index]?.enSentences.join(" ") ?? "";
    const canonical = canonicalUnits[index]?.enSentences.join(" ") ?? "";
    if (stored !== canonical) return true;
  }
  return false;
}

export { DEMO_STORIES } from "../../data/stories/demo-catalog";
export { A_NEW_FRIEND_CH1 } from "../../data/stories/a-new-friend-ch1";