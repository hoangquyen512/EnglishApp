export type RightsStatus =
  | "PUBLIC_DOMAIN"
  | "CC_BY"
  | "CC_BY_SA"
  | "LICENSED"
  | "PENDING_REVIEW"
  | "BLOCKED";

export type StoryStatus = "draft" | "review" | "published" | "archived";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type StoryFilter =
  | "all"
  | "new"
  | "reading"
  | "favorite"
  | "children"
  | "communication";

export type StorySort = "newest" | "popular" | "az" | "level" | "duration";

export type ReaderLanguageMode = "bilingual" | "en" | "vi";

export type StorySummary = {
  id: number;
  slug: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  authorName?: string | null;
  coverUrl: string;
  cefrLevel: CefrLevel;
  genre: string;
  estimatedReadMinutes: number;
  chapterCount: number;
  createdAt: string;
  popularScore: number;
  isFavorite: boolean;
  completedChapters: number;
};
