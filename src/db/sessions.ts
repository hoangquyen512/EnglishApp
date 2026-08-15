import type { ContentType } from "../types";
import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";

interface SessionAggRow {
  content_id: number;
  correct_n: number;
  wrong_n: number;
  last_at: string | null;
}

export async function insertStudySession(input: {
  contentId: number;
  contentType: ContentType;
  isCorrect: boolean;
  answeredAt: string;
}): Promise<void> {
  const userId = requireUserId();
  await execute(
    `INSERT INTO study_sessions (content_id, content_type, is_correct, answered_at, user_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [input.contentId, input.contentType, input.isCorrect ? 1 : 0, input.answeredAt, userId],
  );
}

export async function getSessionStats(
  contentId: number,
  contentType: ContentType,
): Promise<{ correctCount: number; wrongCount: number; lastAnsweredAt: string | null }> {
  const userId = requireUserId();
  const row = await selectOne<SessionAggRow>(
    `SELECT content_id,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_n,
            SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_n,
            MAX(answered_at) AS last_at
     FROM study_sessions
     WHERE content_id = $1 AND content_type = $2 AND user_id = $3`,
    [contentId, contentType, userId],
  );
  return {
    correctCount: row?.correct_n ?? 0,
    wrongCount: row?.wrong_n ?? 0,
    lastAnsweredAt: row?.last_at ?? null,
  };
}

export async function countUniqueCorrect(contentType: ContentType): Promise<number> {
  const userId = requireUserId();
  const row = await selectOne<{ count: number }>(
    `SELECT COUNT(DISTINCT content_id) AS count
     FROM study_sessions
     WHERE content_type = $1 AND is_correct = 1 AND user_id = $2`,
    [contentType, userId],
  );
  return row?.count ?? 0;
}

export async function lastSessionDate(): Promise<string | null> {
  const userId = requireUserId();
  const row = await selectOne<{ answered_at: string }>(
    "SELECT answered_at FROM study_sessions WHERE user_id = $1 ORDER BY answered_at DESC LIMIT 1",
    [userId],
  );
  return row ? row.answered_at.slice(0, 10) : null;
}

export async function topicCorrectCounts(): Promise<
  Array<{ topic: string; learned: number; mastered: number }>
> {
  const userId = requireUserId();
  return select<{ topic: string; learned: number; mastered: number }>(
    `SELECT COALESCE(t.code, p.topic) AS topic,
            COUNT(DISTINCT CASE WHEN s.correct_n >= 1 THEN p.id END) AS learned,
            COUNT(DISTINCT CASE WHEN s.correct_n >= 3 THEN p.id END) AS mastered
     FROM phrases p
     LEFT JOIN topics t ON t.id = p.topic_id
     LEFT JOIN (
       SELECT content_id, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_n
       FROM study_sessions
       WHERE content_type = 'phrase' AND user_id = $1
       GROUP BY content_id
     ) s ON s.content_id = p.id
     GROUP BY COALESCE(t.code, p.topic)`,
    [userId],
  );
}
