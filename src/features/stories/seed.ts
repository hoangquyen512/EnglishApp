import {
  A_NEW_FRIEND_CHAPTER_TITLES,
  DEMO_STORIES,
  OTHER_STORY_CH1_STUBS,
  type DemoStoryMeta,
} from "../../data/stories/demo-catalog";
import {
  A_NEW_FRIEND_CH1,
  type ContentUnitType,
  type FeaturedVocab,
} from "../../data/stories/a-new-friend-ch1";
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

function placeholderUnit(
  chapterIdValue: number,
  orderNo: number,
  en: string,
  vi: string,
): DemoSeedUnit {
  return {
    id: unitId(chapterIdValue, orderNo),
    type: "paragraph",
    orderNo,
    enSentences: [en],
    viSentences: [vi],
  };
}

function mapUnits(
  chapterIdValue: number,
  units: Array<{ type: ContentUnitType; enSentences: string[]; viSentences: string[] }>,
): DemoSeedUnit[] {
  return units.map((unit, index) => ({
    id: unitId(chapterIdValue, index + 1),
    type: unit.type,
    orderNo: index + 1,
    enSentences: unit.enSentences,
    viSentences: unit.viSentences,
  }));
}

function buildANewFriendChapters(storyId: number): DemoSeedChapter[] {
  return A_NEW_FRIEND_CHAPTER_TITLES.map((meta, index) => {
    const chapterNo = index + 1;
    const id = chapterId(storyId, chapterNo);
    const isFirst = chapterNo === 1;

    return {
      id,
      storyId,
      chapterNo,
      slug: meta.slug,
      titleEn: meta.titleEn,
      titleVi: meta.titleVi,
      estimatedReadMinutes: 2,
      orderNo: chapterNo,
      units: isFirst
        ? mapUnits(id, A_NEW_FRIEND_CH1.units)
        : [
            placeholderUnit(
              id,
              1,
              `This chapter continues the story of Sora and Blu — ${meta.titleEn}.`,
              `Chương này tiếp tục câu chuyện của Sora và Blu — ${meta.titleVi}.`,
            ),
          ],
      featured: isFirst ? A_NEW_FRIEND_CH1.featured : [],
    };
  });
}

function buildStubChapters(storyId: number, meta: DemoStoryMeta): DemoSeedChapter[] {
  const chapters: DemoSeedChapter[] = [];
  const stub = OTHER_STORY_CH1_STUBS[meta.slug];

  for (let chapterNo = 1; chapterNo <= meta.chapterCount; chapterNo += 1) {
    const id = chapterId(storyId, chapterNo);
    const isFirst = chapterNo === 1;
    const titleEn = isFirst && stub ? stub.titleEn : `Chapter ${chapterNo}`;
    const titleVi = isFirst && stub ? stub.titleVi : `Chương ${chapterNo}`;

    chapters.push({
      id,
      storyId,
      chapterNo,
      slug: isFirst ? "chapter-1" : `chapter-${chapterNo}`,
      titleEn,
      titleVi,
      estimatedReadMinutes: isFirst ? 2 : 1,
      orderNo: chapterNo,
      units: isFirst && stub
        ? [placeholderUnit(id, 1, stub.en, stub.vi)]
        : [
            placeholderUnit(
              id,
              1,
              `Placeholder content for ${meta.titleEn}, chapter ${chapterNo}.`,
              `Nội dung mẫu cho ${meta.titleVi}, chương ${chapterNo}.`,
            ),
          ],
      featured: [],
    });
  }

  return chapters;
}

export function buildDemoSeedPlan(): DemoSeedPlan {
  const stories: DemoSeedStory[] = DEMO_STORIES.map((meta, index) => {
    const id = index + 1;
    const chapters =
      meta.slug === "a-new-friend"
        ? buildANewFriendChapters(id)
        : buildStubChapters(id, meta);

    return {
      id,
      slug: meta.slug,
      titleEn: meta.titleEn,
      titleVi: meta.titleVi,
      descriptionEn: meta.descriptionEn,
      descriptionVi: meta.descriptionVi,
      coverUrl: `/covers/stories/${meta.coverKey}.webp`,
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
      chapters,
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

export { DEMO_STORIES, A_NEW_FRIEND_CH1 };
