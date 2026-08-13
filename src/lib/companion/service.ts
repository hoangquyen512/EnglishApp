import { and, desc, eq } from "drizzle-orm";
import {
  DEFAULT_TIMEZONE,
  MEMORY_SUMMARY_MAX,
  PET_NAME,
  type Level,
  type Mood,
} from "../constants";
import { db } from "../db";
import { newId } from "../ids";
import { getLlmClient } from "../llm/client";
import type { CoachChip } from "../llm/types";
import { companionState, messages, users } from "../schema";
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
};

function toPublic(row: typeof messages.$inferSelect): PublicMessage {
  return {
    id: row.id,
    role: row.role,
    body: row.body,
    createdAt: new Date(row.createdAt).toISOString(),
    source: row.source,
    hasCoach: Boolean(row.coachJson),
  };
}

async function getUser(userId: string) {
  const row = db.select().from(users).where(eq(users.id, userId)).get();
  if (!row) throw new Error("User not found");
  return row;
}

async function getState(userId: string) {
  const row = db
    .select()
    .from(companionState)
    .where(eq(companionState.userId, userId))
    .get();
  if (!row) throw new Error("Companion state missing");
  return row;
}

export function createCompanionState(userId: string) {
  const now = new Date();
  db.insert(companionState)
    .values({
      userId,
      level: "beginner",
      mood: "unknown",
      moodNote: null,
      memorySummary: "",
      lastCheckinOn: null,
      pendingLevelDirection: null,
      updatedAt: now,
    })
    .run();
}

export function listMessages(userId: string): PublicMessage[] {
  const rows = db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(messages.createdAt)
    .all();
  return rows.map(toPublic);
}

export async function ensureDailyCheckin(userId: string): Promise<PublicMessage | null> {
  const user = await getUser(userId);
  const state = await getState(userId);
  const tz = user.timezone || DEFAULT_TIMEZONE;
  const today = localToday(new Date(), tz);
  const userChattedToday = db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.role, "user"),
        eq(messages.source, "chat"),
      ),
    )
    .all()
    .some((row) => localToday(new Date(row.createdAt), tz) === today);

  if (
    !shouldCreateCheckin({
      lastCheckinOn: state.lastCheckinOn,
      today,
      userChattedToday,
    })
  ) {
    return null;
  }

  const llm = getLlmClient();
  let reply = `Hey, how is your day going?`;
  try {
    const result = await llm.complete({
      petName: PET_NAME,
      level: state.level as Level,
      mood: state.mood as Mood,
      moodNote: state.moodNote,
      memorySummary: state.memorySummary,
      recent: [],
      currentUserMessage: "",
      purpose: "checkin",
    });
    if (result.reply.trim()) reply = result.reply.trim();
  } catch {
    // fallback greeting already set
  }

  const now = new Date();
  const id = newId();
  db.insert(messages)
    .values({
      id,
      userId,
      role: "companion",
      body: reply,
      createdAt: now,
      source: "daily_checkin",
      coachJson: null,
    })
    .run();
  db.update(companionState)
    .set({ lastCheckinOn: today, updatedAt: now })
    .where(eq(companionState.userId, userId))
    .run();

  return {
    id,
    role: "companion",
    body: reply,
    createdAt: now.toISOString(),
    source: "daily_checkin",
    hasCoach: false,
  };
}

export async function sendUserMessage(
  userId: string,
  body: string,
): Promise<{ user: PublicMessage; companion: PublicMessage }> {
  const text = body.trim();
  if (!text) {
    throw Object.assign(new Error("Tin nhắn trống"), { status: 400 });
  }

  const state = await getState(userId);
  const now = new Date();
  const userMessageId = newId();

  db.insert(messages)
    .values({
      id: userMessageId,
      userId,
      role: "user",
      body: text,
      createdAt: now,
      source: "chat",
      coachJson: null,
    })
    .run();

  const history = db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt))
    .all()
    .reverse();

  const ctx = buildLlmContext({
    memorySummary: state.memorySummary,
    history: history
      .filter((row) => row.id !== userMessageId)
      .map((row) => ({ role: row.role, body: row.body })),
    currentUserMessage: text,
  });

  const llm = getLlmClient();
  let result;
  try {
    result = await llm.complete({
      petName: PET_NAME,
      level: state.level as Level,
      mood: state.mood as Mood,
      moodNote: state.moodNote,
      memorySummary: ctx.memorySummary,
      recent: ctx.recent,
      currentUserMessage: ctx.currentUserMessage,
      purpose: "reply",
    });
  } catch (error) {
    throw Object.assign(
      error instanceof Error ? error : new Error("LLM failed"),
      { status: 503, userMessageId },
    );
  }

  const crisis = result.crisis;
  const chips: CoachChip[] = crisis ? [] : result.coach.slice(0, 2);
  if (state.mood === "down") {
    for (const chip of chips) {
      if (chip.type === "grammar") {
        chip.type = "naturaler";
        chip.title_vi = "Cách nói tự nhiên hơn";
      }
    }
  }

  if (chips.length) {
    db.update(messages)
      .set({ coachJson: JSON.stringify(chips) })
      .where(eq(messages.id, userMessageId))
      .run();
  }

  const companionId = newId();
  const companionAt = new Date();
  db.insert(messages)
    .values({
      id: companionId,
      userId,
      role: "companion",
      body: result.reply,
      createdAt: companionAt,
      source: "chat",
      coachJson: null,
    })
    .run();

  const nextMood = applyMood(
    { mood: state.mood as Mood, moodNote: state.moodNote },
    result.mood,
  );
  const total = db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .all().length;

  let level = state.level as Level;
  let pending = (state.pendingLevelDirection as LevelDirection | null) ?? null;
  let memorySummary = state.memorySummary;
  if (shouldRewriteMemory(total)) {
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

  db.update(companionState)
    .set({
      mood: nextMood.mood,
      moodNote: nextMood.moodNote,
      level,
      pendingLevelDirection: pending,
      memorySummary,
      updatedAt: companionAt,
    })
    .where(eq(companionState.userId, userId))
    .run();

  return {
    user: {
      id: userMessageId,
      role: "user",
      body: text,
      createdAt: now.toISOString(),
      source: "chat",
      hasCoach: chips.length > 0,
    },
    companion: {
      id: companionId,
      role: "companion",
      body: result.reply,
      createdAt: companionAt.toISOString(),
      source: "chat",
      hasCoach: false,
    },
  };
}

export function getCoach(userId: string, messageId: string): CoachChip[] {
  const row = db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
    .get();
  if (!row) {
    throw Object.assign(new Error("Không tìm thấy tin"), { status: 404 });
  }
  if (!row.coachJson) return [];
  return JSON.parse(row.coachJson) as CoachChip[];
}

export function getProfile(userId: string) {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  const state = db
    .select()
    .from(companionState)
    .where(eq(companionState.userId, userId))
    .get();
  if (!user || !state) {
    throw Object.assign(new Error("Không tìm thấy hồ sơ"), { status: 404 });
  }
  return {
    displayName: user.displayName,
    email: user.email,
    level: state.level as Level,
    mood: state.mood as Mood,
    moodNote: state.moodNote,
    petName: PET_NAME,
  };
}

