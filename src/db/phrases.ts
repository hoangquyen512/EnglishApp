import type { CefrLevel, Phrase, PhraseTopic } from "../types";
import { select, selectOne } from "./client";
import { requireUserId } from "./current-user";

interface PhraseRow {
  id: number;
  phrase_en: string;
  meaning_vi: string;
  topic: PhraseTopic;
  level: CefrLevel;
  created_at: string;
}

function mapPhrase(row: PhraseRow): Phrase {
  return {
    id: row.id,
    phraseEn: row.phrase_en,
    meaningVi: row.meaning_vi,
    topic: row.topic,
    level: row.level,
    createdAt: row.created_at,
  };
}

export async function listPhrases(topic?: PhraseTopic | null): Promise<Phrase[]> {
  if (topic) {
    const rows = await select<PhraseRow>(
      `SELECT id, phrase_en, meaning_vi, topic, level, created_at
       FROM phrases WHERE topic = $1 ORDER BY id ASC`,
      [topic],
    );
    return rows.map(mapPhrase);
  }
  const rows = await select<PhraseRow>(
    "SELECT id, phrase_en, meaning_vi, topic, level, created_at FROM phrases ORDER BY id ASC",
  );
  return rows.map(mapPhrase);
}

export async function getPhraseById(id: number): Promise<Phrase | null> {
  const row = await selectOne<PhraseRow>(
    "SELECT id, phrase_en, meaning_vi, topic, level, created_at FROM phrases WHERE id = $1",
    [id],
  );
  return row ? mapPhrase(row) : null;
}

export async function listUnseenOrWrongPhrases(
  topic?: PhraseTopic | null,
): Promise<Phrase[]> {
  const userId = requireUserId();
  const topicClause = topic ? "AND p.topic = $2" : "";
  const params = topic ? [userId, topic] : [userId];
  const rows = await select<PhraseRow>(
    `SELECT p.id, p.phrase_en, p.meaning_vi, p.topic, p.level, p.created_at
     FROM phrases p
     LEFT JOIN (
       SELECT content_id,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_n,
              SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_n,
              MAX(answered_at) AS last_at
       FROM study_sessions
       WHERE content_type = 'phrase' AND user_id = $1
       GROUP BY content_id
     ) s ON s.content_id = p.id
     WHERE 1 = 1 ${topicClause}
     ORDER BY CASE WHEN s.content_id IS NULL THEN 0 WHEN s.wrong_n > 0 THEN 1 ELSE 2 END, s.last_at ASC, p.id ASC`,
    params,
  );
  return rows.map(mapPhrase);
}
