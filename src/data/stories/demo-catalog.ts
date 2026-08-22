import type { CefrLevel } from "../../features/stories/types";

export type DemoStoryMeta = {
  slug: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  cefrLevel: CefrLevel;
  genre: string;
  chapterCount: number;
  estimatedReadMinutes: number;
  coverKey: string;
  popularScore: number;
  createdAt: string;
};

export const DEMO_STORIES: DemoStoryMeta[] = [
  {
    slug: "a-new-friend",
    titleEn: "A New Friend",
    titleVi: "Người bạn mới",
    descriptionEn:
      "Little fox Sora meets a small friend in the forest on a starry night. Friendship begins with a hello.",
    descriptionVi:
      "Chú cáo Sora gặp một người bạn nhỏ trong khu rừng vào một đêm đầy sao. Tình bạn bắt đầu từ một lời chào.",
    cefrLevel: "A1",
    genre: "children",
    chapterCount: 12,
    estimatedReadMinutes: 20,
    coverKey: "a-new-friend",
    popularScore: 100,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
  {
    slug: "the-lost-star",
    titleEn: "The Lost Star",
    titleVi: "Ngôi sao lạc",
    descriptionEn: "A little star loses its way and searches for its own light.",
    descriptionVi: "Ngôi sao nhỏ lạc đường đi tìm ánh sáng của chính mình.",
    cefrLevel: "A1",
    genre: "children",
    chapterCount: 10,
    estimatedReadMinutes: 18,
    coverKey: "the-lost-star",
    popularScore: 80,
    createdAt: "2026-08-02T00:00:00.000Z",
  },
  {
    slug: "milo-and-the-moon",
    titleEn: "Milo and the Moon",
    titleVi: "Milo và mặt trăng",
    descriptionEn: "Milo dreams of touching the moon and begins an adventure.",
    descriptionVi: "Milo mơ ước chạm tới mặt trăng và bắt đầu chuyến phiêu lưu.",
    cefrLevel: "A2",
    genre: "children",
    chapterCount: 12,
    estimatedReadMinutes: 22,
    coverKey: "milo-and-the-moon",
    popularScore: 90,
    createdAt: "2026-08-03T00:00:00.000Z",
  },
  {
    slug: "a-day-at-the-park",
    titleEn: "A Day at the Park",
    titleVi: "Một ngày ở công viên",
    descriptionEn: "A fun day at the park with friends and simple conversations.",
    descriptionVi: "Một ngày vui vẻ ở công viên cùng bạn bè.",
    cefrLevel: "A1",
    genre: "communication",
    chapterCount: 8,
    estimatedReadMinutes: 15,
    coverKey: "a-day-at-the-park",
    popularScore: 70,
    createdAt: "2026-08-04T00:00:00.000Z",
  },
  {
    slug: "the-brave-little-bird",
    titleEn: "The Brave Little Bird",
    titleVi: "Chú chim nhỏ dũng cảm",
    descriptionEn: "A small bird bravely learns to fly high.",
    descriptionVi: "Chú chim nhỏ dũng cảm học cách bay cao.",
    cefrLevel: "A2",
    genre: "children",
    chapterCount: 9,
    estimatedReadMinutes: 16,
    coverKey: "the-brave-little-bird",
    popularScore: 75,
    createdAt: "2026-08-05T00:00:00.000Z",
  },
  {
    slug: "soras-secret-garden",
    titleEn: "Sora's Secret Garden",
    titleVi: "Khu vườn bí mật của Sora",
    descriptionEn: "A secret garden and the wonders waiting inside.",
    descriptionVi: "Khu vườn bí mật và những điều kỳ diệu.",
    cefrLevel: "A2",
    genre: "children",
    chapterCount: 10,
    estimatedReadMinutes: 17,
    coverKey: "soras-secret-garden",
    popularScore: 85,
    createdAt: "2026-08-06T00:00:00.000Z",
  },
];

/** Demo library metadata. Full bilingual chapter prose lives in src/data/stories/content/. */
