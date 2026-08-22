import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UI } from "../../constants/ui";
import type { StoryDetail, StorySummary } from "../../features/stories";
import { StoryDetailPanel } from "./story-detail-panel";

const story: StorySummary = {
  id: 1,
  slug: "a-new-friend",
  titleEn: "A New Friend",
  titleVi: "Một người bạn mới",
  descriptionEn: "A quiet forest friendship.",
  descriptionVi: "Một tình bạn dịu dàng trong khu rừng.",
  coverUrl: "/stories/a-new-friend.jpg",
  cefrLevel: "A1",
  genre: "children",
  estimatedReadMinutes: 12,
  chapterCount: 2,
  createdAt: "2026-08-22T00:00:00.000Z",
  popularScore: 10,
  isFavorite: false,
  completedChapters: 0,
  hasProgress: false,
};

const detail: StoryDetail = {
  ...story,
  authorName: null,
  publicationYear: null,
  rightsStatus: "LICENSED",
  attributionRequired: true,
  attributionText: "Yume internal demo story.",
};

describe("StoryDetailPanel", () => {
  it("shows available chapters without lock controls", () => {
    const html = renderToStaticMarkup(
      createElement(StoryDetailPanel, {
        story,
        detail,
        chapters: [
          {
            id: 11,
            storyId: 1,
            chapterNo: 1,
            slug: "hello",
            titleEn: "Hello",
            titleVi: "Xin chào",
            estimatedReadMinutes: 5,
            orderNo: 1,
          },
        ],
        selectedChapterId: 11,
        onSelectChapter: vi.fn(),
        onToggleFavorite: vi.fn(),
        onShare: vi.fn(),
        onOpenReader: vi.fn(),
      }),
    );

    expect(html).toContain(UI.storyChapters);
    expect(html).toContain(UI.storyReadSelectedChapter);
    expect(html.replace("&amp;", "&")).toContain(UI.storyAttribution);
    expect(html).toContain("Yume internal demo story.");
    expect(html).not.toMatch(/lock|khóa/i);
  });
});
