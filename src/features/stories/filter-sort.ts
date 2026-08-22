import type { CefrLevel, StoryFilter, StorySort, StorySummary } from "./types";

const CEFR_ORDER: Record<CefrLevel, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
};

function matchesSearch(story: StorySummary, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    story.titleEn,
    story.titleVi,
    story.descriptionEn,
    story.descriptionVi,
    story.genre,
    story.authorName ?? "",
  ]
    .join("\n")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesFilter(story: StorySummary, filter: StoryFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "new":
      return !story.hasProgress;
    case "reading":
      return story.hasProgress && story.completedChapters < story.chapterCount;
    case "favorite":
      return story.isFavorite;
    case "children":
      return story.genre.toLowerCase() === "children";
    case "communication":
      return story.genre.toLowerCase() === "communication";
  }
}

function compareStories(a: StorySummary, b: StorySummary, sort: StorySort): number {
  switch (sort) {
    case "newest":
      return b.createdAt.localeCompare(a.createdAt) || a.id - b.id;
    case "popular":
      return b.popularScore - a.popularScore || a.id - b.id;
    case "az":
      return a.titleEn.localeCompare(b.titleEn, "en", { sensitivity: "base" }) || a.id - b.id;
    case "level":
      return CEFR_ORDER[a.cefrLevel] - CEFR_ORDER[b.cefrLevel] || a.id - b.id;
    case "duration":
      return a.estimatedReadMinutes - b.estimatedReadMinutes || a.id - b.id;
  }
}

export function filterAndSortStories(
  stories: StorySummary[],
  query: { search: string; filter: StoryFilter; sort: StorySort },
): StorySummary[] {
  return stories
    .filter((story) => matchesSearch(story, query.search))
    .filter((story) => matchesFilter(story, query.filter))
    .slice()
    .sort((a, b) => compareStories(a, b, query.sort));
}
