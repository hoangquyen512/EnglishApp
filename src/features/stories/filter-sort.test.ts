import { describe, expect, it } from "vitest";
import { filterAndSortStories } from "./filter-sort";
import type { StorySummary } from "./types";

function story(overrides: Partial<StorySummary> & Pick<StorySummary, "id" | "titleEn">): StorySummary {
  return {
    slug: `story-${overrides.id}`,
    titleVi: overrides.titleVi ?? overrides.titleEn,
    descriptionEn: "",
    descriptionVi: "",
    coverUrl: "",
    cefrLevel: "A1",
    genre: "general",
    estimatedReadMinutes: 10,
    chapterCount: 5,
    createdAt: "2026-01-01T00:00:00.000Z",
    popularScore: 0,
    isFavorite: false,
    completedChapters: 0,
    hasProgress: false,
    ...overrides,
  };
}

const FIXTURE: StorySummary[] = [
  story({
    id: 1,
    titleEn: "Alpha Tale",
    titleVi: "Chuyện Alpha",
    descriptionEn: "A quiet forest adventure",
    genre: "children",
    cefrLevel: "A2",
    estimatedReadMinutes: 20,
    createdAt: "2026-01-03T00:00:00.000Z",
    popularScore: 50,
    isFavorite: true,
    completedChapters: 0,
  }),
  story({
    id: 2,
    titleEn: "Beta Story",
    titleVi: "Chuyện Beta",
    descriptionEn: "Daily communication practice",
    genre: "communication",
    cefrLevel: "B1",
    estimatedReadMinutes: 15,
    createdAt: "2026-01-02T00:00:00.000Z",
    popularScore: 100,
    hasProgress: true,
    completedChapters: 2,
    chapterCount: 5,
  }),
  story({
    id: 3,
    titleEn: "Gamma Book",
    titleVi: "Sách Gamma",
    descriptionVi: "một cuốn sách thiếu nhi",
    genre: "children",
    cefrLevel: "A1",
    estimatedReadMinutes: 30,
    createdAt: "2026-01-01T00:00:00.000Z",
    popularScore: 10,
    hasProgress: true,
    completedChapters: 5,
    chapterCount: 5,
  }),
];

describe("filterAndSortStories", () => {
  it("matches search case-insensitively on title and description", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "FOREST",
      filter: "all",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([1]);
  });

  it("matches search on Vietnamese title", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "gamma",
      filter: "all",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([3]);
  });

  it("filters favorites", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "favorite",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([1]);
  });

  it("filters in-progress reading stories", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "reading",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([2]);
  });

  it("treats chapter-one progress as reading without counting it completed", () => {
    const chapterOneProgress = story({
      id: 4,
      titleEn: "Started Story",
      hasProgress: true,
      completedChapters: 0,
    });

    expect(
      filterAndSortStories([chapterOneProgress], {
        search: "",
        filter: "reading",
        sort: "newest",
      }).map((item) => item.id),
    ).toEqual([4]);
    expect(
      filterAndSortStories([chapterOneProgress], {
        search: "",
        filter: "new",
        sort: "newest",
      }),
    ).toEqual([]);
  });

  it("filters by children genre", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "children",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([1, 3]);
  });

  it("filters by communication genre", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "communication",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([2]);
  });

  it("filters new (not started) stories", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "new",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([1]);
  });

  it("sorts A–Z by English title", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "all",
      sort: "az",
    });
    expect(result.map((s) => s.titleEn)).toEqual([
      "Alpha Tale",
      "Beta Story",
      "Gamma Book",
    ]);
  });

  it("sorts by CEFR level A1→C1", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "all",
      sort: "level",
    });
    expect(result.map((s) => s.cefrLevel)).toEqual(["A1", "A2", "B1"]);
  });

  it("sorts by duration ascending", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "all",
      sort: "duration",
    });
    expect(result.map((s) => s.estimatedReadMinutes)).toEqual([15, 20, 30]);
  });

  it("sorts by popular score descending", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "all",
      sort: "popular",
    });
    expect(result.map((s) => s.popularScore)).toEqual([100, 50, 10]);
  });

  it("sorts newest first by createdAt", () => {
    const result = filterAndSortStories(FIXTURE, {
      search: "",
      filter: "all",
      sort: "newest",
    });
    expect(result.map((s) => s.id)).toEqual([1, 2, 3]);
  });
});
