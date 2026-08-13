import { LEVELS, LLM_HISTORY_LIMIT, type Level, type Mood } from "../constants";

export type LevelDirection = "up" | "down" | "keep";

export function shouldCreateCheckin(input: {
  lastCheckinOn: string | null;
  today: string;
  userChattedToday: boolean;
}): boolean {
  if (input.userChattedToday) return false;
  if (input.lastCheckinOn === input.today) return false;
  return true;
}

export function applyMood(
  current: { mood: Mood; moodNote: string | null },
  signal: { mood: Mood; moodNote?: string | null } | null,
): { mood: Mood; moodNote: string | null } {
  if (!signal) return current;
  if (signal.mood === "unknown" && !signal.moodNote) return current;
  return {
    mood: signal.mood,
    moodNote: signal.moodNote ?? current.moodNote,
  };
}

function shiftLevel(level: Level, direction: Exclude<LevelDirection, "keep">): Level {
  const index = LEVELS.indexOf(level);
  const next = direction === "up" ? index + 1 : index - 1;
  return LEVELS[Math.min(LEVELS.length - 1, Math.max(0, next))] ?? level;
}

export function applyLevelCadence(input: {
  level: Level;
  pendingDirection: LevelDirection | null;
  suggestion: LevelDirection;
}): { level: Level; pendingDirection: LevelDirection | null } {
  if (input.suggestion === "keep") {
    return { level: input.level, pendingDirection: "keep" };
  }
  if (input.pendingDirection === input.suggestion) {
    return {
      level: shiftLevel(input.level, input.suggestion),
      pendingDirection: null,
    };
  }
  return { level: input.level, pendingDirection: input.suggestion };
}

export function buildLlmContext(input: {
  memorySummary: string;
  history: { role: "user" | "companion"; body: string }[];
  currentUserMessage: string;
}): {
  memorySummary: string;
  recent: { role: "user" | "companion"; body: string }[];
  currentUserMessage: string;
} {
  return {
    memorySummary: input.memorySummary,
    recent: input.history.slice(-LLM_HISTORY_LIMIT),
    currentUserMessage: input.currentUserMessage,
  };
}

export function localToday(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function shouldRewriteMemory(messageCount: number): boolean {
  return messageCount > 0 && messageCount % 8 === 0;
}
