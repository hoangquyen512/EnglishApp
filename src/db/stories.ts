import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";
import { isTauri } from "../lib/tauri";
import { readBrowserJson, writeBrowserJson } from "../lib/browser-persist";

export const STORIES_BROWSER_KEY = "yume-stories-v1";

export interface StoryListRow {
  id: number;
  slug: string;
  title_en: string;
  title_vi: string;
  description_en: string;
  description_vi: string;
  author_name: string | null;
  cover_url: string;
  cefr_level: string;
  genre: string;
  estimated_read_minutes: number;
  chapter_count: number;
  created_at: string;
  popular_score: number;
  status: string;
  rights_status: string;
  source_type: string;
  is_favorite: number;
  completed_chapters: number;
}

export interface StoryProgressRow {
  id: number;
  user_id: number;
  story_id: number;
  chapter_id: number | null;
  sentence_id: number | null;
  content_unit_id: number | null;
  progress_percentage: number;
  last_read_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface InsertStoryInput {
  slug: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  sourceId: number;
  coverUrl: string;
  cefrLevel: string;
  genre: string;
  estimatedReadMinutes: number;
  popularScore?: number;
  status: string;
  createdAt: string;
}

interface BrowserSource {
  id: number;
  name: string;
  sourceType: string;
}

interface BrowserRights {
  rightsStatus: string;
  attributionRequired: boolean;
  attributionText: string | null;
  authorCredit: string | null;
}

interface BrowserSentence {
  id: number;
  orderNo: number;
  sourceText: string;
  translation: string | null;
}

interface BrowserUnit {
  id: number;
  unitType: string;
  orderNo: number;
  sentences: BrowserSentence[];
}

interface BrowserFeaturedVocabulary {
  id: number;
  sentenceId: number | null;
  word: string;
  lemma: string;
  ipa: string | null;
  partOfSpeech: string | null;
  meaningVi: string;
  orderNo: number;
}

interface BrowserChapter {
  id: number;
  chapterNo: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  estimatedReadMinutes: number;
  orderNo: number;
  status: string;
  units: BrowserUnit[];
  featured: BrowserFeaturedVocabulary[];
}

interface BrowserStory extends InsertStoryInput {
  id: number;
  rights: BrowserRights | null;
  chapters: BrowserChapter[];
}

interface BrowserStoriesStore {
  sources: BrowserSource[];
  stories: BrowserStory[];
  progress: StoryProgressRow[];
  favorites: Array<{ userId: number; storyId: number }>;
}

const EMPTY_BROWSER_STORE: BrowserStoriesStore = {
  sources: [],
  stories: [],
  progress: [],
  favorites: [],
};

function readBrowserStore(): BrowserStoriesStore {
  return readBrowserJson<BrowserStoriesStore>(STORIES_BROWSER_KEY) ?? structuredClone(EMPTY_BROWSER_STORE);
}

function writeBrowserStore(store: BrowserStoriesStore): void {
  writeBrowserJson(STORIES_BROWSER_KEY, store);
}

function nextId(items: Array<{ id: number }>): number {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}

export async function countPublishedStories(): Promise<number> {
  if (!isTauri()) {
    return readBrowserStore().stories.filter((story) => story.status === "published").length;
  }
  const row = await selectOne<{ count: number }>(
    "SELECT COUNT(*) AS count FROM stories WHERE status = 'published'",
  );
  return row?.count ?? 0;
}

export async function insertSource(input: {
  name: string;
  sourceType: string;
}): Promise<number> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const id = nextId(store.sources);
    store.sources.push({ id, name: input.name, sourceType: input.sourceType });
    writeBrowserStore(store);
    return id;
  }
  const result = await execute(
    "INSERT INTO story_sources (name, source_type) VALUES ($1, $2)",
    [input.name, input.sourceType],
  );
  return result.lastInsertId;
}

export async function insertStory(input: InsertStoryInput): Promise<number> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const id = nextId(store.stories);
    store.stories.push({ ...input, id, rights: null, chapters: [] });
    writeBrowserStore(store);
    return id;
  }
  const result = await execute(
    `INSERT INTO stories
      (slug, title_en, title_vi, description_en, description_vi, source_id, cover_url,
       cefr_level, genre, estimated_read_minutes, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)`,
    [
      input.slug,
      input.titleEn,
      input.titleVi,
      input.descriptionEn,
      input.descriptionVi,
      input.sourceId,
      input.coverUrl,
      input.cefrLevel,
      input.genre,
      input.estimatedReadMinutes,
      input.status,
      input.createdAt,
    ],
  );
  return result.lastInsertId;
}

export async function insertStoryRights(input: {
  storyId: number;
  sourceId: number;
  rightsStatus: string;
  attributionRequired: boolean;
  attributionText?: string | null;
  authorCredit?: string | null;
}): Promise<void> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const story = store.stories.find((item) => item.id === input.storyId);
    if (!story) throw new Error(`Story ${input.storyId} not found`);
    story.rights = {
      rightsStatus: input.rightsStatus,
      attributionRequired: input.attributionRequired,
      attributionText: input.attributionText ?? null,
      authorCredit: input.authorCredit ?? null,
    };
    writeBrowserStore(store);
    return;
  }
  await execute(
    `INSERT INTO story_rights
      (story_id, source_id, rights_status, attribution_required, attribution_text, author_credit)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.storyId,
      input.sourceId,
      input.rightsStatus,
      input.attributionRequired ? 1 : 0,
      input.attributionText ?? null,
      input.authorCredit ?? null,
    ],
  );
}

export async function insertChapter(input: {
  storyId: number;
  chapterNo: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  estimatedReadMinutes: number;
  orderNo: number;
  status: string;
}): Promise<number> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const story = store.stories.find((item) => item.id === input.storyId);
    if (!story) throw new Error(`Story ${input.storyId} not found`);
    const id = nextId(store.stories.flatMap((item) => item.chapters));
    story.chapters.push({ ...input, id, units: [], featured: [] });
    writeBrowserStore(store);
    return id;
  }
  const result = await execute(
    `INSERT INTO story_chapters
      (story_id, chapter_no, slug, title_en, title_vi, estimated_read_minutes, order_no, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.storyId,
      input.chapterNo,
      input.slug,
      input.titleEn,
      input.titleVi,
      input.estimatedReadMinutes,
      input.orderNo,
      input.status,
    ],
  );
  return result.lastInsertId;
}

export async function insertContentUnit(input: {
  chapterId: number;
  unitType: string;
  orderNo: number;
}): Promise<number> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const chapters = store.stories.flatMap((story) => story.chapters);
    const chapter = chapters.find((item) => item.id === input.chapterId);
    if (!chapter) throw new Error(`Chapter ${input.chapterId} not found`);
    const id = nextId(chapters.flatMap((item) => item.units));
    chapter.units.push({ id, unitType: input.unitType, orderNo: input.orderNo, sentences: [] });
    writeBrowserStore(store);
    return id;
  }
  const result = await execute(
    `INSERT INTO story_content_units (chapter_id, unit_type, order_no)
     VALUES ($1, $2, $3)`,
    [input.chapterId, input.unitType, input.orderNo],
  );
  return result.lastInsertId;
}

export async function insertSentence(input: {
  contentUnitId: number;
  orderNo: number;
  sourceText: string;
  cefrLevel?: string | null;
}): Promise<number> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const units = store.stories.flatMap((story) =>
      story.chapters.flatMap((chapter) => chapter.units),
    );
    const unit = units.find((item) => item.id === input.contentUnitId);
    if (!unit) throw new Error(`Content unit ${input.contentUnitId} not found`);
    const id = nextId(units.flatMap((item) => item.sentences));
    unit.sentences.push({ id, orderNo: input.orderNo, sourceText: input.sourceText, translation: null });
    writeBrowserStore(store);
    return id;
  }
  const wordCount = input.sourceText.trim() ? input.sourceText.trim().split(/\s+/).length : 0;
  const result = await execute(
    `INSERT INTO story_sentences
      (content_unit_id, order_no, source_language, source_text, word_count, cefr_level)
     VALUES ($1, $2, 'en', $3, $4, $5)`,
    [input.contentUnitId, input.orderNo, input.sourceText, wordCount, input.cefrLevel ?? null],
  );
  return result.lastInsertId;
}

export async function insertSentenceTranslation(input: {
  sentenceId: number;
  text: string;
}): Promise<void> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const sentence = store.stories
      .flatMap((story) => story.chapters)
      .flatMap((chapter) => chapter.units)
      .flatMap((unit) => unit.sentences)
      .find((item) => item.id === input.sentenceId);
    if (!sentence) throw new Error(`Sentence ${input.sentenceId} not found`);
    sentence.translation = input.text;
    writeBrowserStore(store);
    return;
  }
  await execute(
    `INSERT INTO story_sentence_translations
      (sentence_id, language, text, translation_type, review_status)
     VALUES ($1, 'vi', $2, 'INTERNAL_DEMO', 'approved')`,
    [input.sentenceId, input.text],
  );
}

export async function insertFeaturedVocabulary(input: {
  chapterId: number;
  sentenceId?: number | null;
  word: string;
  lemma: string;
  ipa?: string | null;
  partOfSpeech?: string | null;
  meaningVi: string;
  orderNo: number;
}): Promise<number> {
  if (!isTauri()) {
    const store = readBrowserStore();
    const chapters = store.stories.flatMap((story) => story.chapters);
    const chapter = chapters.find((item) => item.id === input.chapterId);
    if (!chapter) throw new Error(`Chapter ${input.chapterId} not found`);
    const id = nextId(chapters.flatMap((item) => item.featured));
    chapter.featured.push({
      id,
      sentenceId: input.sentenceId ?? null,
      word: input.word,
      lemma: input.lemma,
      ipa: input.ipa ?? null,
      partOfSpeech: input.partOfSpeech ?? null,
      meaningVi: input.meaningVi,
      orderNo: input.orderNo,
    });
    writeBrowserStore(store);
    return id;
  }
  const result = await execute(
    `INSERT INTO story_featured_vocabulary
      (chapter_id, sentence_id, word, lemma, ipa, part_of_speech, meaning_vi, order_no)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.chapterId,
      input.sentenceId ?? null,
      input.word,
      input.lemma,
      input.ipa ?? null,
      input.partOfSpeech ?? null,
      input.meaningVi,
      input.orderNo,
    ],
  );
  return result.lastInsertId;
}

export async function listPublishedStories(): Promise<StoryListRow[]> {
  const userId = requireUserId();
  if (!isTauri()) {
    const store = readBrowserStore();
    const sourceById = new Map(store.sources.map((source) => [source.id, source]));
    return store.stories
      .filter((story) => story.status === "published")
      .map((story) => {
        const progress = store.progress.find(
          (item) => item.user_id === userId && item.story_id === story.id,
        );
        const currentChapter = story.chapters.find(
          (chapter) => chapter.id === progress?.chapter_id,
        );
        const completedChapters = currentChapter
          ? progress?.completed_at
            ? currentChapter.orderNo
            : Math.max(0, currentChapter.orderNo - 1)
          : 0;
        return {
          id: story.id,
          slug: story.slug,
          title_en: story.titleEn,
          title_vi: story.titleVi,
          description_en: story.descriptionEn,
          description_vi: story.descriptionVi,
          author_name: story.rights?.authorCredit ?? null,
          cover_url: story.coverUrl,
          cefr_level: story.cefrLevel,
          genre: story.genre,
          estimated_read_minutes: story.estimatedReadMinutes,
          chapter_count: story.chapters.length,
          created_at: story.createdAt,
          popular_score: story.popularScore ?? 0,
          status: story.status,
          rights_status: story.rights?.rightsStatus ?? "PENDING_REVIEW",
          source_type: sourceById.get(story.sourceId)?.sourceType ?? "",
          is_favorite: store.favorites.some(
            (favorite) => favorite.userId === userId && favorite.storyId === story.id,
          )
            ? 1
            : 0,
          completed_chapters: completedChapters,
        };
      });
  }
  return select<StoryListRow>(
    `SELECT
       s.id, s.slug, s.title_en, s.title_vi,
       COALESCE(s.description_en, '') AS description_en,
       COALESCE(s.description_vi, '') AS description_vi,
       sr.author_credit AS author_name,
       COALESCE(s.cover_url, '') AS cover_url,
       s.cefr_level,
       COALESCE(s.genre, '') AS genre,
       COALESCE(s.estimated_read_minutes, 0) AS estimated_read_minutes,
       COUNT(DISTINCT sc.id) AS chapter_count,
       s.created_at,
       0 AS popular_score,
       s.status,
       sr.rights_status,
       ss.source_type,
       CASE WHEN usf.story_id IS NULL THEN 0 ELSE 1 END AS is_favorite,
       CASE
         WHEN usp.chapter_id IS NULL THEN 0
         WHEN usp.completed_at IS NOT NULL THEN COALESCE(current_chapter.order_no, 0)
         WHEN COALESCE(current_chapter.order_no, 0) > 1 THEN current_chapter.order_no - 1
         ELSE 0
       END AS completed_chapters
     FROM stories s
     JOIN story_sources ss ON ss.id = s.source_id
     JOIN story_rights sr ON sr.story_id = s.id
     LEFT JOIN story_chapters sc ON sc.story_id = s.id
     LEFT JOIN user_story_favorites usf ON usf.story_id = s.id AND usf.user_id = $1
     LEFT JOIN user_story_progress usp ON usp.story_id = s.id AND usp.user_id = $1
     LEFT JOIN story_chapters current_chapter ON current_chapter.id = usp.chapter_id
     WHERE s.status = 'published'
     GROUP BY s.id, sr.id, usf.story_id, usp.id, current_chapter.id
     ORDER BY s.created_at DESC, s.id ASC`,
    [userId],
  );
}

export async function getProgress(storyId: number): Promise<StoryProgressRow | null> {
  const userId = requireUserId();
  if (!isTauri()) {
    return (
      readBrowserStore().progress.find(
        (item) => item.user_id === userId && item.story_id === storyId,
      ) ?? null
    );
  }
  return selectOne<StoryProgressRow>(
    `SELECT id, user_id, story_id, chapter_id, sentence_id, content_unit_id,
            progress_percentage, last_read_at, completed_at, updated_at
     FROM user_story_progress WHERE user_id = $1 AND story_id = $2`,
    [userId, storyId],
  );
}

export async function upsertProgress(input: {
  storyId: number;
  chapterId?: number | null;
  sentenceId?: number | null;
  contentUnitId?: number | null;
  progressPercentage: number;
  lastReadAt?: string | null;
  completedAt?: string | null;
  updatedAt: string;
}): Promise<void> {
  const userId = requireUserId();
  if (!isTauri()) {
    const store = readBrowserStore();
    const existing = store.progress.find(
      (item) => item.user_id === userId && item.story_id === input.storyId,
    );
    const row: StoryProgressRow = {
      id: existing?.id ?? nextId(store.progress),
      user_id: userId,
      story_id: input.storyId,
      chapter_id: input.chapterId ?? null,
      sentence_id: input.sentenceId ?? null,
      content_unit_id: input.contentUnitId ?? null,
      progress_percentage: input.progressPercentage,
      last_read_at: input.lastReadAt ?? null,
      completed_at: input.completedAt ?? null,
      updated_at: input.updatedAt,
    };
    if (existing) Object.assign(existing, row);
    else store.progress.push(row);
    writeBrowserStore(store);
    return;
  }
  await execute(
    `INSERT INTO user_story_progress
      (user_id, story_id, chapter_id, sentence_id, content_unit_id,
       progress_percentage, last_read_at, completed_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT(user_id, story_id) DO UPDATE SET
       chapter_id = excluded.chapter_id,
       sentence_id = excluded.sentence_id,
       content_unit_id = excluded.content_unit_id,
       progress_percentage = excluded.progress_percentage,
       last_read_at = excluded.last_read_at,
       completed_at = excluded.completed_at,
       updated_at = excluded.updated_at`,
    [
      userId,
      input.storyId,
      input.chapterId ?? null,
      input.sentenceId ?? null,
      input.contentUnitId ?? null,
      input.progressPercentage,
      input.lastReadAt ?? null,
      input.completedAt ?? null,
      input.updatedAt,
    ],
  );
}

export async function toggleFavorite(storyId: number): Promise<boolean> {
  const userId = requireUserId();
  if (!isTauri()) {
    const store = readBrowserStore();
    const index = store.favorites.findIndex(
      (item) => item.userId === userId && item.storyId === storyId,
    );
    if (index >= 0) {
      store.favorites.splice(index, 1);
      writeBrowserStore(store);
      return false;
    }
    store.favorites.push({ userId, storyId });
    writeBrowserStore(store);
    return true;
  }
  const existing = await selectOne<{ story_id: number }>(
    "SELECT story_id FROM user_story_favorites WHERE user_id = $1 AND story_id = $2",
    [userId, storyId],
  );
  if (existing) {
    await execute(
      "DELETE FROM user_story_favorites WHERE user_id = $1 AND story_id = $2",
      [userId, storyId],
    );
    return false;
  }
  await execute(
    "INSERT INTO user_story_favorites (user_id, story_id) VALUES ($1, $2)",
    [userId, storyId],
  );
  return true;
}
