import {
  ensureStoriesSeeded,
  getStoryProgress,
  listChapters,
  listStorySummaries,
  type StoryChapter,
} from "./service";
import type { StorySummary } from "./types";

export interface HomeStoryTeaser {
  story: StorySummary;
  chapterId: number;
}

export function pickRandomStory<T>(stories: readonly T[]): T | null {
  if (stories.length === 0) return null;
  const index = Math.floor(Math.random() * stories.length);
  return stories[index] ?? null;
}

export function resolveReaderChapterId(
  chapters: ReadonlyArray<Pick<StoryChapter, "id">>,
  progressChapterId: number | null | undefined,
): number | null {
  if (
    progressChapterId &&
    chapters.some((chapter) => chapter.id === progressChapterId)
  ) {
    return progressChapterId;
  }
  return chapters[0]?.id ?? null;
}

export async function pickRandomHomeStoryTeaser(): Promise<HomeStoryTeaser | null> {
  await ensureStoriesSeeded();
  const stories = await listStorySummaries();
  const story = pickRandomStory(stories);
  if (!story) return null;

  const chapters = await listChapters(story.id);
  const progress = story.hasProgress ? await getStoryProgress(story.id) : null;
  const chapterId = resolveReaderChapterId(chapters, progress?.chapterId ?? null);
  if (!chapterId) return null;

  return { story, chapterId };
}
