import { describe, expect, it } from "vitest";
import type { StoryListRow } from "../../db/stories";
import { mapStorySummaries } from "./service";

function row(overrides: Partial<StoryListRow> & Pick<StoryListRow, "id">): StoryListRow {
  return {
    slug: `story-${overrides.id}`,
    title_en: `Story ${overrides.id}`,
    title_vi: `Truyện ${overrides.id}`,
    description_en: "",
    description_vi: "",
    author_name: null,
    cover_url: "",
    cefr_level: "A1",
    genre: "children",
    estimated_read_minutes: 10,
    chapter_count: 1,
    created_at: "2026-08-22T00:00:00.000Z",
    popular_score: 0,
    status: "published",
    rights_status: "LICENSED",
    source_type: "INTERNAL_DEMO",
    is_favorite: 0,
    completed_chapters: 0,
    has_progress: 0,
    ...overrides,
  };
}

describe("mapStorySummaries", () => {
  it("uses canPublishStory to filter a mixed fixture list", () => {
    const rows = [
      row({ id: 1, rights_status: "PUBLIC_DOMAIN", source_type: "GUTENBERG" }),
      row({ id: 2, rights_status: "PENDING_REVIEW", source_type: "STORYWEAVER" }),
      row({ id: 3, status: "draft", rights_status: "CC_BY", source_type: "STORYWEAVER" }),
      row({ id: 4, rights_status: "LICENSED", source_type: "INTERNAL_DEMO" }),
    ];

    expect(mapStorySummaries(rows).map((story) => story.id)).toEqual([1, 4]);
  });

  it("surfaces an existing progress row before chapter one is completed", () => {
    const [summary] = mapStorySummaries([
      row({ id: 1, has_progress: 1, completed_chapters: 0 }),
    ]);

    expect(summary).toMatchObject({ hasProgress: true, completedChapters: 0 });
  });
});
