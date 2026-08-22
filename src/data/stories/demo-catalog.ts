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

/** Chapter titles for A New Friend (chapters 2–12 are placeholders). */
export const A_NEW_FRIEND_CHAPTER_TITLES: Array<{
  slug: string;
  titleEn: string;
  titleVi: string;
}> = [
  { slug: "first-hello", titleEn: "First Hello", titleVi: "Lời chào đầu tiên" },
  { slug: "in-the-forest", titleEn: "In the Forest", titleVi: "Trong khu rừng" },
  { slug: "a-scared-bird", titleEn: "A Scared Bird", titleVi: "Chú chim sợ hãi" },
  {
    slug: "berries-and-leaves",
    titleEn: "Berries and Leaves",
    titleVi: "Quả mọng và lá cây",
  },
  { slug: "starry-night", titleEn: "Starry Night", titleVi: "Đêm đầy sao" },
  { slug: "rainy-day", titleEn: "Rainy Day", titleVi: "Ngày mưa" },
  { slug: "the-big-tree", titleEn: "The Big Tree", titleVi: "Cây to" },
  { slug: "lost-and-found", titleEn: "Lost and Found", titleVi: "Lạc và tìm thấy" },
  { slug: "a-new-song", titleEn: "A New Song", titleVi: "Bài hát mới" },
  { slug: "winter-winds", titleEn: "Winter Winds", titleVi: "Gió mùa đông" },
  { slug: "spring-returns", titleEn: "Spring Returns", titleVi: "Mùa xuân trở lại" },
  { slug: "best-friends", titleEn: "Best Friends", titleVi: "Bạn thân" },
];

/** Minimal chapter-1 stubs for non–A New Friend stories. */
export const OTHER_STORY_CH1_STUBS: Record<
  string,
  { titleEn: string; titleVi: string; en: string; vi: string }
> = {
  "the-lost-star": {
    titleEn: "A Faint Light",
    titleVi: "Ánh sáng mờ",
    en: "Far above the hills, a tiny star flickered and wondered where home might be.",
    vi: "Trên những ngọn đồi xa, một ngôi sao nhỏ lấp lánh và tự hỏi nhà ở đâu.",
  },
  "milo-and-the-moon": {
    titleEn: "Milo Looks Up",
    titleVi: "Milo ngước nhìn",
    en: "Milo stood on his balcony and whispered, \"One day I will touch the moon.\"",
    vi: "Milo đứng trên ban công và thì thầm: \"Một ngày nào đó tớ sẽ chạm tới mặt trăng.\"",
  },
  "a-day-at-the-park": {
    titleEn: "Meeting at the Gate",
    titleVi: "Gặp nhau ở cổng",
    en: "\"Hi! Are you ready for the picnic?\" asked Lin. \"Yes, I brought sandwiches,\" said Sam.",
    vi: "\"Chào! Cậu sẵn sàng đi dã ngoại chưa?\" Lin hỏi. \"Rồi, tớ mang bánh mì kẹp,\" Sam đáp.",
  },
  "the-brave-little-bird": {
    titleEn: "On the Branch",
    titleVi: "Trên cành cây",
    en: "Pip the bird looked down from the branch. The ground seemed very far away.",
    vi: "Pip nhìn xuống từ cành cây. Mặt đất trông thật xa.",
  },
  "soras-secret-garden": {
    titleEn: "Behind the Gate",
    titleVi: "Sau cánh cổng",
    en: "Sora found a rusty gate hidden by ivy. Something sweet smelled like flowers inside.",
    vi: "Sora tìm thấy một cánh cổng rỉ sét bị che bởi dây leo. Một mùi thơm ngọt ngào như hoa bên trong.",
  },
};
