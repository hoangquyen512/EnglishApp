import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";

export interface CompanionMessageRow {
  id: number;
  user_id: number;
  role: "user" | "companion";
  body: string;
  created_at: string;
  source: "chat" | "daily_checkin";
  coach_json: string | null;
}

export interface CompanionStateRow {
  user_id: number;
  level: string;
  mood: string;
  mood_note: string | null;
  memory_summary: string;
  last_checkin_on: string | null;
  pending_level_direction: string | null;
  updated_at: string;
}

export async function listCompanionMessages(): Promise<CompanionMessageRow[]> {
  const userId = requireUserId();
  return select<CompanionMessageRow>(
    `SELECT id, user_id, role, body, created_at, source, coach_json
     FROM companion_messages WHERE user_id = $1 ORDER BY id ASC`,
    [userId],
  );
}

export async function insertCompanionMessage(input: {
  role: "user" | "companion";
  body: string;
  createdAt: string;
  source: "chat" | "daily_checkin";
  coachJson?: string | null;
}): Promise<number> {
  const userId = requireUserId();
  await execute(
    `INSERT INTO companion_messages (user_id, role, body, created_at, source, coach_json)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, input.role, input.body, input.createdAt, input.source, input.coachJson ?? null],
  );
  const row = await selectOne<{ id: number }>(
    "SELECT id FROM companion_messages WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
    [userId],
  );
  if (!row) {
    throw new Error("Failed to insert companion message");
  }
  return row.id;
}

export async function updateCompanionCoach(id: number, coachJson: string): Promise<void> {
  const userId = requireUserId();
  await execute(
    "UPDATE companion_messages SET coach_json = $1 WHERE id = $2 AND user_id = $3",
    [coachJson, id, userId],
  );
}

export async function getCompanionState(): Promise<CompanionStateRow | null> {
  const userId = requireUserId();
  return selectOne<CompanionStateRow>(
    `SELECT user_id, level, mood, mood_note, memory_summary, last_checkin_on, pending_level_direction, updated_at
     FROM companion_state WHERE user_id = $1`,
    [userId],
  );
}

export async function ensureCompanionState(): Promise<CompanionStateRow> {
  const existing = await getCompanionState();
  if (existing) {
    return existing;
  }
  const userId = requireUserId();
  const now = new Date().toISOString();
  await execute(
    `INSERT INTO companion_state (user_id, level, mood, memory_summary, updated_at)
     VALUES ($1, 'beginner', 'unknown', '', $2)`,
    [userId, now],
  );
  const created = await getCompanionState();
  if (!created) {
    throw new Error("Failed to create companion state");
  }
  return created;
}

export async function updateCompanionState(input: {
  level: string;
  mood: string;
  moodNote: string | null;
  memorySummary: string;
  lastCheckinOn: string | null;
  pendingLevelDirection: string | null;
  updatedAt: string;
}): Promise<void> {
  const userId = requireUserId();
  await execute(
    `UPDATE companion_state
     SET level = $1, mood = $2, mood_note = $3, memory_summary = $4,
         last_checkin_on = $5, pending_level_direction = $6, updated_at = $7
     WHERE user_id = $8`,
    [
      input.level,
      input.mood,
      input.moodNote,
      input.memorySummary,
      input.lastCheckinOn,
      input.pendingLevelDirection,
      input.updatedAt,
      userId,
    ],
  );
}
