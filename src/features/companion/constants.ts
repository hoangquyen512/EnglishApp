export const PET_NAME = "Sora";
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export const MOODS = ["up", "ok", "down", "unknown"] as const;
export type Mood = (typeof MOODS)[number];

export const LLM_HISTORY_LIMIT = 10;
export const MEMORY_SUMMARY_MAX = 800;
