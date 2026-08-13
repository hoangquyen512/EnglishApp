export const APP_NAME = "Yume";
export const PET_NAME = "Sora";
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export const MOODS = ["up", "ok", "down", "unknown"] as const;
export type Mood = (typeof MOODS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Đang ở mức dễ",
  intermediate: "Đang ở mức vừa",
  advanced: "Đang ở mức khá",
};

export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
export const LLM_TIMEOUT_MS = 20_000;
export const MEMORY_CADENCE = 8;
export const LLM_HISTORY_LIMIT = 10;
export const MEMORY_SUMMARY_MAX = 800;
