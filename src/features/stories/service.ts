import {
  countPublishedStories,
  insertChapter,
  insertContentUnit,
  insertFeaturedVocabulary,
  insertSentence,
  insertSentenceTranslation,
  insertSource,
  insertStory,
  insertStoryRights,
  listPublishedStories,
  type StoryListRow,
} from "../../db/stories";
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
