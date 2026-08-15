export type TopicCategory = "daily_life" | "work_study" | "social" | "finance";

export type TopicCode =
  | "family"
  | "food_dining"
  | "shopping"
  | "health"
  | "weather"
  | "housing"
  | "transportation"
  | "office_work"
  | "meetings_presentations"
  | "business_email"
  | "job_interview"
  | "education"
  | "travel"
  | "hobbies_entertainment"
  | "sports"
  | "technology_social_media"
  | "small_talk_greetings"
  | "banking_finance";

export type ContentTypePreference = "vocabulary" | "phrase" | "both";

export type CefrLevelPreference = "A1" | "A2" | "B1" | "B2";

export interface TopicDefinition {
  code: TopicCode;
  nameVi: string;
  nameEn: string;
  category: TopicCategory;
  iconKey: string;
}

export const TOPIC_CATEGORY_LABELS: Record<TopicCategory, string> = {
  daily_life: "Đời sống hàng ngày",
  work_study: "Công việc & học tập",
  social: "Xã hội & giải trí",
  finance: "Tài chính",
};

export const TOPIC_CATALOG: TopicDefinition[] = [
  { code: "family", nameVi: "Gia đình", nameEn: "Family", category: "daily_life", iconKey: "family" },
  { code: "food_dining", nameVi: "Ẩm thực", nameEn: "Food & dining", category: "daily_life", iconKey: "food_dining" },
  { code: "shopping", nameVi: "Mua sắm", nameEn: "Shopping", category: "daily_life", iconKey: "shopping" },
  { code: "health", nameVi: "Sức khoẻ", nameEn: "Health", category: "daily_life", iconKey: "health" },
  { code: "weather", nameVi: "Thời tiết", nameEn: "Weather", category: "daily_life", iconKey: "weather" },
  { code: "housing", nameVi: "Nhà cửa", nameEn: "Housing", category: "daily_life", iconKey: "housing" },
  { code: "transportation", nameVi: "Giao thông", nameEn: "Transportation", category: "daily_life", iconKey: "transportation" },
  { code: "office_work", nameVi: "Công việc văn phòng", nameEn: "Office work", category: "work_study", iconKey: "office_work" },
  {
    code: "meetings_presentations",
    nameVi: "Họp hành & thuyết trình",
    nameEn: "Meetings & presentations",
    category: "work_study",
    iconKey: "meetings_presentations",
  },
  {
    code: "business_email",
    nameVi: "Email công việc",
    nameEn: "Business email",
    category: "work_study",
    iconKey: "business_email",
  },
  {
    code: "job_interview",
    nameVi: "Phỏng vấn xin việc",
    nameEn: "Job interview",
    category: "work_study",
    iconKey: "job_interview",
  },
  { code: "education", nameVi: "Giáo dục", nameEn: "Education", category: "work_study", iconKey: "education" },
  { code: "travel", nameVi: "Du lịch", nameEn: "Travel", category: "social", iconKey: "travel" },
  {
    code: "hobbies_entertainment",
    nameVi: "Sở thích & giải trí",
    nameEn: "Hobbies & entertainment",
    category: "social",
    iconKey: "hobbies_entertainment",
  },
  { code: "sports", nameVi: "Thể thao", nameEn: "Sports", category: "social", iconKey: "sports" },
  {
    code: "technology_social_media",
    nameVi: "Công nghệ & mạng xã hội",
    nameEn: "Technology & social media",
    category: "social",
    iconKey: "technology_social_media",
  },
  {
    code: "small_talk_greetings",
    nameVi: "Giao tiếp xã giao",
    nameEn: "Small talk & greetings",
    category: "social",
    iconKey: "small_talk_greetings",
  },
  {
    code: "banking_finance",
    nameVi: "Ngân hàng & tài chính",
    nameEn: "Banking & finance",
    category: "finance",
    iconKey: "banking_finance",
  },
];

export const DEFAULT_ACTIVE_TOPIC_CODES: TopicCode[] = [
  "family",
  "food_dining",
  "office_work",
  "travel",
];

export const TOPIC_BY_CODE = new Map(TOPIC_CATALOG.map((topic) => [topic.code, topic]));

export function isTopicCode(value: string): value is TopicCode {
  return TOPIC_BY_CODE.has(value as TopicCode);
}

export function topicsByCategory(): Record<TopicCategory, TopicDefinition[]> {
  return {
    daily_life: TOPIC_CATALOG.filter((topic) => topic.category === "daily_life"),
    work_study: TOPIC_CATALOG.filter((topic) => topic.category === "work_study"),
    social: TOPIC_CATALOG.filter((topic) => topic.category === "social"),
    finance: TOPIC_CATALOG.filter((topic) => topic.category === "finance"),
  };
}
