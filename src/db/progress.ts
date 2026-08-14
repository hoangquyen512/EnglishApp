import type { TopicProgress, UserProgress } from "../types";
import { execute, selectOne } from "./client";
import { requireUserId } from "./current-user";

interface ProgressRow {
  id: number;
  total_words_learned: number;
  total_phrases_learned: number;
  current_streak: number;
  longest_streak: number;
  progress_by_topic: string | null;
  updated_at: string;
}

function parseTopics(raw: string | null): Record<string, TopicProgress> {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, TopicProgress>;
    }
  } catch {
    return {};
  }
  return {};
}

function mapProgress(row: ProgressRow): UserProgress {
  return {
    id: row.id,
    totalWordsLearned: row.total_words_learned,
    totalPhrasesLearned: row.total_phrases_learned,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    progressByTopic: parseTopics(row.progress_by_topic),
    updatedAt: row.updated_at,
  };
}

export async function getUserProgress(): Promise<UserProgress | null> {
  const userId = requireUserId();
  const row = await selectOne<ProgressRow>(
    `SELECT id, total_words_learned, total_phrases_learned, current_streak, longest_streak,
            progress_by_topic, updated_at
     FROM user_progress WHERE user_id = $1 ORDER BY id ASC LIMIT 1`,
    [userId],
  );
  return row ? mapProgress(row) : null;
}

export async function updateUserProgress(input: {
  id: number;
  totalWordsLearned: number;
  totalPhrasesLearned: number;
  currentStreak: number;
  longestStreak: number;
  progressByTopic: Record<string, TopicProgress>;
  updatedAt: string;
}): Promise<void> {
  const userId = requireUserId();
  await execute(
    `UPDATE user_progress
     SET total_words_learned = $1,
         total_phrases_learned = $2,
         current_streak = $3,
         longest_streak = $4,
         progress_by_topic = $5,
         updated_at = $6
     WHERE id = $7 AND user_id = $8`,
    [
      input.totalWordsLearned,
      input.totalPhrasesLearned,
      input.currentStreak,
      input.longestStreak,
      JSON.stringify(input.progressByTopic),
      input.updatedAt,
      input.id,
      userId,
    ],
  );
}
