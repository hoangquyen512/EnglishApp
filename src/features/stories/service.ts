import {
  countPublishedStories,
  deleteStoryBookmark,
  getProgress,
  getPublishedStory,
  insertStoryBookmark,
  insertChapter,
  insertContentUnit,
  insertFeaturedVocabulary,
  insertSentence,
  insertSentenceTranslation,
  insertSource,
  insertStory,
  insertStoryRights,
  listChapterContentRows,
  listChapterFeaturedVocabulary,
  listPublishedChapters,
  listPublishedStories,
  listSavedUserStoryVocabulary,
  toggleFavorite,
  upsertProgress,
  upsertUserStoryVocabulary,
  type StoryBookmarkInput,
  type UserStoryVocabularyInput,
  type StoryListRow,
} from "../../db/stories";
import { mapContentUnits } from "./content-map";
import { canPublishStory } from "./publish";
import { buildDemoSeedPlan } from "./seed";
import type { CefrLevel, StorySummary } from "./types";

const DEMO_POPULAR_SCORE = new Map(
  buildDemoSeedPlan().stories.map((story) => [story.slug, story.popularScore]),
);

let seedInFlight: Promise<void> | null = null;

async function insertDemoStories(): Promise<void> {
  if ((await countPublishedStories()) > 0) return;

  const plan = buildDemoSeedPlan();
  const sourceId = await insertSource({
    name: plan.sourceName,
    sourceType: plan.sourceType,
  });

  for (const story of plan.stories) {
    const storyId = await insertStory({
      slug: story.slug,
      titleEn: story.titleEn,
      titleVi: story.titleVi,
      descriptionEn: story.descriptionEn,
      descriptionVi: story.descriptionVi,
      sourceId,
      coverUrl: story.coverUrl,
      cefrLevel: story.cefrLevel,
      genre: story.genre,
      estimatedReadMinutes: story.estimatedReadMinutes,
      popularScore: story.popularScore,
      status: story.status,
      createdAt: story.createdAt,
    });
    await insertStoryRights({
      storyId,
      sourceId,
      rightsStatus: story.rightsStatus,
      attributionRequired: story.attributionRequired,
      attributionText: story.attributionText,
    });

    for (const chapter of story.chapters) {
      const chapterId = await insertChapter({
        storyId,
        chapterNo: chapter.chapterNo,
        slug: chapter.slug,
        titleEn: chapter.titleEn,
        titleVi: chapter.titleVi,
        estimatedReadMinutes: chapter.estimatedReadMinutes,
        orderNo: chapter.orderNo,
        status: "published",
      });

      for (const unit of chapter.units) {
        const contentUnitId = await insertContentUnit({
          chapterId,
          unitType: unit.type,
          orderNo: unit.orderNo,
        });
        for (let index = 0; index < unit.enSentences.length; index += 1) {
          const sentenceId = await insertSentence({
            contentUnitId,
            orderNo: index + 1,
            sourceText: unit.enSentences[index]!,
            cefrLevel: story.cefrLevel,
          });
          await insertSentenceTranslation({
            sentenceId,
            text: unit.viSentences[index] ?? "",
          });
        }
      }

      for (const featured of chapter.featured) {
        await insertFeaturedVocabulary({
          chapterId,
          word: featured.word,
          lemma: featured.lemma,
          ipa: featured.ipa,
          partOfSpeech: featured.partOfSpeech,
          meaningVi: featured.meaningVi,
          orderNo: featured.orderNo,
        });
      }
    }
  }
}

export function ensureStoriesSeeded(): Promise<void> {
  if (!seedInFlight) {
    seedInFlight = insertDemoStories().finally(() => {
      seedInFlight = null;
    });
  }
  return seedInFlight;
}

export function mapStorySummaries(rows: StoryListRow[]): StorySummary[] {
  return rows
    .filter((row) =>
      canPublishStory({
        status: row.status,
        rightsStatus: row.rights_status,
        sourceType: row.source_type,
      }),
    )
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      titleEn: row.title_en,
      titleVi: row.title_vi,
      descriptionEn: row.description_en,
      descriptionVi: row.description_vi,
      authorName: row.author_name,
      coverUrl: row.cover_url,
      cefrLevel: row.cefr_level as CefrLevel,
      genre: row.genre,
      estimatedReadMinutes: row.estimated_read_minutes,
      chapterCount: row.chapter_count,
      createdAt: row.created_at,
      popularScore: row.popular_score || DEMO_POPULAR_SCORE.get(row.slug) || 0,
      isFavorite: row.is_favorite === 1,
      completedChapters: row.completed_chapters,
    }));
}

export async function listStorySummaries(): Promise<StorySummary[]> {
  return mapStorySummaries(await listPublishedStories());
}

export interface StoryDetail {
  id: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  authorName: string | null;
  coverUrl: string;
  cefrLevel: CefrLevel;
  genre: string;
  estimatedReadMinutes: number;
  publicationYear: number | null;
  rightsStatus: string;
  attributionRequired: boolean;
  attributionText: string | null;
}

export interface StoryChapter {
  id: number;
  storyId: number;
  chapterNo: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  estimatedReadMinutes: number;
  orderNo: number;
}

export interface ChapterContent {
  chapterId: number;
  units: Array<{
    id: number;
    unitType: string;
    orderNo: number;
    sentences: Array<{ id: number; en: string; vi: string }>;
  }>;
}

export interface UserStoryProgress {
  storyId: number;
  chapterId: number | null;
  sentenceId: number | null;
  contentUnitId: number | null;
  progressPercentage: number;
  lastReadAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface SaveProgressInput {
  storyId: number;
  chapterId?: number | null;
  sentenceId?: number | null;
  contentUnitId?: number | null;
  progressPercentage: number;
  lastReadAt?: string | null;
  completedAt?: string | null;
}

export interface FeaturedVocabulary {
  id: number;
  chapterId: number;
  sentenceId: number | null;
  word: string;
  lemma: string;
  ipa: string | null;
  partOfSpeech: string | null;
  meaningVi: string;
  orderNo: number;
  audioUrl: string | null;
}

export interface UserStoryVocabulary {
  id: number;
  word: string;
  lemma: string;
  ipa: string | null;
  meaningVi: string;
  storyId: number;
  chapterId: number;
  sentenceId: number | null;
  originalSentence: string | null;
  contextTranslation: string | null;
  masteryLevel: number;
  savedAt: string;
  updatedAt: string;
}

export async function getStoryDetail(storyId: number): Promise<StoryDetail | null> {
  const row = await getPublishedStory(storyId);
  if (
    !row ||
    !canPublishStory({
      status: row.status,
      rightsStatus: row.rights_status,
      sourceType: row.source_type,
    })
  ) {
    return null;
  }
  return {
    id: row.id,
    slug: row.slug,
    titleEn: row.title_en,
    titleVi: row.title_vi,
    descriptionEn: row.description_en,
    descriptionVi: row.description_vi,
    authorName: row.author_name,
    coverUrl: row.cover_url,
    cefrLevel: row.cefr_level as CefrLevel,
    genre: row.genre,
    estimatedReadMinutes: row.estimated_read_minutes,
    publicationYear: row.publication_year,
    rightsStatus: row.rights_status,
    attributionRequired: row.attribution_required === 1,
    attributionText: row.attribution_text,
  };
}

export async function listChapters(storyId: number): Promise<StoryChapter[]> {
  return (await listPublishedChapters(storyId)).map((row) => ({
    id: row.id,
    storyId: row.story_id,
    chapterNo: row.chapter_no,
    slug: row.slug,
    titleEn: row.title_en,
    titleVi: row.title_vi,
    estimatedReadMinutes: row.estimated_read_minutes,
    orderNo: row.order_no,
  }));
}

export async function getChapterContent(chapterId: number): Promise<ChapterContent> {
  const units = mapContentUnits(await listChapterContentRows(chapterId));
  return {
    chapterId,
    units: units.map((unit) => ({
      id: unit.id,
      unitType: unit.type,
      orderNo: unit.orderNo,
      sentences: unit.sentenceIds.map((id, index) => ({
        id,
        en: unit.en[index] ?? "",
        vi: unit.vi[index] ?? "",
      })),
    })),
  };
}

export async function getStoryProgress(
  storyId: number,
): Promise<UserStoryProgress | null> {
  const row = await getProgress(storyId);
  if (!row) return null;
  return {
    storyId: row.story_id,
    chapterId: row.chapter_id,
    sentenceId: row.sentence_id,
    contentUnitId: row.content_unit_id,
    progressPercentage: row.progress_percentage,
    lastReadAt: row.last_read_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

export async function saveStoryProgress(input: SaveProgressInput): Promise<void> {
  await upsertProgress({
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export function toggleStoryFavorite(storyId: number): Promise<boolean> {
  return toggleFavorite(storyId);
}

export function addStoryBookmark(input: StoryBookmarkInput): Promise<void> {
  return insertStoryBookmark(input);
}

export function removeStoryBookmark(input: StoryBookmarkInput): Promise<void> {
  return deleteStoryBookmark(input);
}

export async function listFeaturedVocabulary(
  chapterId: number,
): Promise<FeaturedVocabulary[]> {
  return (await listChapterFeaturedVocabulary(chapterId)).map((row) => ({
    id: row.id,
    chapterId: row.chapter_id,
    sentenceId: row.sentence_id,
    word: row.word,
    lemma: row.lemma,
    ipa: row.ipa,
    partOfSpeech: row.part_of_speech,
    meaningVi: row.meaning_vi,
    orderNo: row.order_no,
    audioUrl: row.audio_url,
  }));
}

export function saveUserStoryVocabulary(
  input: UserStoryVocabularyInput,
): Promise<void> {
  return upsertUserStoryVocabulary(input);
}

export async function listUserStoryVocabulary(): Promise<UserStoryVocabulary[]> {
  return (await listSavedUserStoryVocabulary()).map((row) => ({
    id: row.id,
    word: row.word,
    lemma: row.lemma,
    ipa: row.ipa,
    meaningVi: row.meaning_vi,
    storyId: row.story_id,
    chapterId: row.chapter_id,
    sentenceId: row.sentence_id,
    originalSentence: row.original_sentence,
    contextTranslation: row.context_translation,
    masteryLevel: row.mastery_level,
    savedAt: row.saved_at,
    updatedAt: row.updated_at,
  }));
}
