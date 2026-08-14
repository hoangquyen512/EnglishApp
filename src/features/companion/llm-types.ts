import type { Level, Mood } from "./constants";
import type { LevelDirection } from "./rules";

export type CoachChip = {
  type: "naturaler" | "vocab" | "grammar";
  title_vi: string;
  suggestion_en: string;
  explain_vi: string;
  original_en?: string;
};

export type LlmTurnInput = {
  petName: string;
  level: Level;
  mood: Mood;
  moodNote: string | null;
  memorySummary: string;
  recent: { role: "user" | "companion"; body: string }[];
  currentUserMessage: string;
  purpose: "reply" | "checkin";
};

export type LlmTurnResult = {
  reply: string;
  mood: { mood: Mood; moodNote?: string | null } | null;
  coach: CoachChip[];
  levelSuggestion: LevelDirection;
  memorySummary?: string;
  crisis: boolean;
};

export type LlmClient = {
  complete(input: LlmTurnInput): Promise<LlmTurnResult>;
};
