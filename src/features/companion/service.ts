import { DEFAULT_PET_NAME } from "../../constants/ui";
import { isTauri } from "../../lib/tauri";
import {
  ensureCompanionState,
  insertCompanionMessage,
  listCompanionMessages,
  updateCompanionCoach,
  updateCompanionState,
  type CompanionMessageRow,
} from "../../db/companion";
import { peekCurrentUserId } from "../../db/current-user";
import { readBrowserJson, writeBrowserJson } from "../../lib/browser-persist";
import { MEMORY_SUMMARY_MAX, type Level, type Mood } from "./constants";
import { createFakeLlm } from "./fake-llm";
import type { CoachChip } from "./llm-types";
import {
  applyLevelCadence,
  applyMood,
  buildLlmContext,
  localToday,
  shouldCreateCheckin,
  shouldRewriteMemory,
  type LevelDirection,
} from "./rules";

export type PublicMessage = {
  id: string;
  role: "user" | "companion";
  body: string;
  createdAt: string;
  source: "chat" | "daily_checkin";
  hasCoach: boolean;
  coach?: CoachChip[];
};

const llm = createFakeLlm();
const TIMEZONE = "Asia/Ho_Chi_Minh";

type MemoryMsg = PublicMessage;
const memoryMessages: MemoryMsg[] = [];
let loadedFor: number | null = null;
let memoryState = {
  level: "beginner" as Level,
  mood: "unknown" as Mood,
  moodNote: null as string | null,
  memorySummary: "",
  lastCheckinOn: null as string | null,
  pending: null as LevelDirection | null,
};

function emptyMemoryState() {
  return {
    level: "beginner" as Level,
    mood: "unknown" as Mood,
    moodNote: null as string | null,
    memorySummary: "",
    lastCheckinOn: null as string | null,
    pending: null as LevelDirection | null,
  };
}

function chatKey(userId: number): string {
  return `yume-demo-chat:${userId}`;
}

function ensureMemoryLoaded(): void {
  const userId = peekCurrentUserId();
  if (userId === null || loadedFor === userId) {
    return;
  }
  loadedFor = userId;
  const saved = readBrowserJson<{ messages?: MemoryMsg[]; state?: typeof memoryState }>(chatKey(userId));
  memoryMessages.length = 0;
  if (saved?.messages) {
    memoryMessages.push(...saved.messages);
  }
  memoryState = saved?.state ?? emptyMemoryState();
}

function persistMemory(): void {
  const userId = peekCurrentUserId();
  if (userId === null) {
    return;
  }
  writeBrowserJson(chatKey(userId), { messages: memoryMessages, state: memoryState });
}

function toPublic(row: CompanionMessageRow): PublicMessage {
  const coach = row.coach_json ? (JSON.parse(row.coach_json) as CoachChip[]) : [];
  return {
    id: String(row.id),
    role: row.role,
    body: row.body,
    createdAt: row.created_at,
    source: row.source,
    hasCoach: coach.length > 0,
    coach,
  };
}

export async function listThread(): Promise<PublicMessage[]> {
  if (!isTauri()) {
    ensureMemoryLoaded();
    return [...memoryMessages];
  }
  const rows = await listCompanionMessages();
  return rows.map(toPublic);
}

export async function ensureDailyCheckin(): Promise<PublicMessage[]> {
  const items = await listThread();
  const today = localToday(new Date(), TIMEZONE);
  const userChattedToday = items.some(
    (item) => item.role === "user" && item.source === "chat" && item.createdAt.slice(0, 10) === today,
  );
  const lastCheckinOn = isTauri()
    ? (await ensureCompanionState()).last_checkin_on
    : memoryState.lastCheckinOn;
  if (!shouldCreateCheckin({ lastCheckinOn, today, userChattedToday })) {
    return items;
  }

  const state = isTauri() ? await ensureCompanionState() : memoryState;
  const result = await llm.complete({
    petName: DEFAULT_PET_NAME,
    level: (isTauri() ? (state as { level: string }).level : memoryState.level) as Level,
    mood: (isTauri() ? (state as { mood: string }).mood : memoryState.mood) as Mood,
    moodNote: isTauri() ? (state as { mood_note: string | null }).mood_note : memoryState.moodNote,
    memorySummary: isTauri() ? (state as { memory_summary: string }).memory_summary : memoryState.memorySummary,
    recent: [],
    currentUserMessage: "",
    purpose: "checkin",
  });
  const now = new Date().toISOString();
  if (!isTauri()) {
    const message: PublicMessage = {
      id: `mem-${Date.now()}`,
      role: "companion",
      body: result.reply,
      createdAt: now,
      source: "daily_checkin",
      hasCoach: false,
    };
    memoryMessages.push(message);
    memoryState.lastCheckinOn = today;
    persistMemory();
    return [...memoryMessages];
  }

  await insertCompanionMessage({
    role: "companion",
    body: result.reply,
    createdAt: now,
    source: "daily_checkin",
  });
  const persisted = await ensureCompanionState();
  await updateCompanionState({
    level: persisted.level,
    mood: persisted.mood,
    moodNote: persisted.mood_note,
    memorySummary: persisted.memory_summary,
    lastCheckinOn: today,
    pendingLevelDirection: persisted.pending_level_direction,
    updatedAt: now,
  });
  return listThread();
}

export async function sendCompanionMessage(body: string): Promise<PublicMessage[]> {
  const text = body.trim();
  if (!text) {
    throw new Error("empty");
  }
  const now = new Date().toISOString();
  if (!isTauri()) {
    ensureMemoryLoaded();
    memoryMessages.push({
      id: `u-${Date.now()}`,
      role: "user",
      body: text,
      createdAt: now,
      source: "chat",
      hasCoach: false,
    });
    const result = await llm.complete({
      petName: DEFAULT_PET_NAME,
      level: memoryState.level,
      mood: memoryState.mood,
      moodNote: memoryState.moodNote,
      memorySummary: memoryState.memorySummary,
      recent: memoryMessages.slice(-10).map((item) => ({ role: item.role, body: item.body })),
      currentUserMessage: text,
      purpose: "reply",
    });
    const chips = result.crisis ? [] : result.coach.slice(0, 2);
    if (chips.length) {
      const last = memoryMessages[memoryMessages.length - 1];
      if (last) {
        last.hasCoach = true;
        last.coach = chips;
      }
    }
    memoryMessages.push({
      id: `c-${Date.now()}`,
      role: "companion",
      body: result.reply,
      createdAt: new Date().toISOString(),
      source: "chat",
      hasCoach: false,
    });
    const nextMood = applyMood({ mood: memoryState.mood, moodNote: memoryState.moodNote }, result.mood);
    memoryState = {
      ...memoryState,
      mood: nextMood.mood,
      moodNote: nextMood.moodNote,
    };
    persistMemory();
    return [...memoryMessages];
  }

  await ensureCompanionState();
  const userId = await insertCompanionMessage({
    role: "user",
    body: text,
    createdAt: now,
    source: "chat",
  });
  const history = await listCompanionMessages();
  const state = await ensureCompanionState();
  const ctx = buildLlmContext({
    memorySummary: state.memory_summary,
    history: history
      .filter((row) => row.id !== userId)
      .map((row) => ({ role: row.role, body: row.body })),
    currentUserMessage: text,
  });
  const result = await llm.complete({
    petName: DEFAULT_PET_NAME,
    level: state.level as Level,
    mood: state.mood as Mood,
    moodNote: state.mood_note,
    memorySummary: ctx.memorySummary,
    recent: ctx.recent,
    currentUserMessage: ctx.currentUserMessage,
    purpose: "reply",
  });
  const chips: CoachChip[] = result.crisis ? [] : result.coach.slice(0, 2);
  if (chips.length) {
    await updateCompanionCoach(userId, JSON.stringify(chips));
  }
  const companionAt = new Date().toISOString();
  await insertCompanionMessage({
    role: "companion",
    body: result.reply,
    createdAt: companionAt,
    source: "chat",
  });
  const nextMood = applyMood(
    { mood: state.mood as Mood, moodNote: state.mood_note },
    result.mood,
  );
  let level = state.level as Level;
  let pending = (state.pending_level_direction as LevelDirection | null) ?? null;
  let memorySummary = state.memory_summary;
  if (shouldRewriteMemory(history.length + 1)) {
    const cadence = applyLevelCadence({
      level,
      pendingDirection: pending,
      suggestion: result.levelSuggestion,
    });
    level = cadence.level;
    pending = cadence.pendingDirection;
    if (result.memorySummary) {
      memorySummary = result.memorySummary.slice(0, MEMORY_SUMMARY_MAX);
    }
  }
  await updateCompanionState({
    level,
    mood: nextMood.mood,
    moodNote: nextMood.moodNote,
    memorySummary,
    lastCheckinOn: state.last_checkin_on,
    pendingLevelDirection: pending,
    updatedAt: companionAt,
  });
  return listThread();
}
