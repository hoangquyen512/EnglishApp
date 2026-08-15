import type { CefrLevel, Phrase } from "../types";
import { select, selectOne } from "./client";
import { requireUserId } from "./current-user";
import { mapLegacyPhraseTopic } from "../features/learning-program/mapping";
import { isTopicCode } from "../features/learning-program/catalog";

interface PhraseRow {
  id: number;
  phrase_en: string;
  meaning_vi: string;
  topic: string;
  topic_id: number | null;
  topic_code: string | null;
  level: CefrLevel;
  created_at: string;
}

function resolveTopic(row: PhraseRow): string {
  if (row.topic_code && isTopicCode(row.topic_code)) {
    return row.topic_code;
  }
  return mapLegacyPhraseTopic(row.topic) ?? row.topic;
}

function mapPhrase(row: PhraseRow): Phrase {
  return {
    id: row.id,
    phraseEn: row.phrase_en,
    meaningVi: row.meaning_vi,
    topic: resolveTopic(row),
    topicId: row.topic_id,
    level: row.level,
    createdAt: row.created_at,
  };
}

const PHRASE_COLUMNS = `p.id, p.phrase_en, p.meaning_vi, p.topic, p.topic_id, t.code AS topic_code, p.level, p.created_at`;

export async function listPhrases(topicIds?: number[] | null): Promise<Phrase[]> {
  if (topicIds && topicIds.length > 0) {
    const placeholders = topicIds.map((_, index) => `$${index + 1}`).join(", ");
    const rows = await select<PhraseRow>(
      `SELECT ${PHRASE_COLUMNS}
       FROM phrases p
       LEFT JOIN topics t ON t.id = p.topic_id
       WHERE p.topic_id IN (${placeholders})
       ORDER BY p.id ASC`,
      topicIds,
    );
    return rows.map(mapPhrase);
  }
  const rows = await select<PhraseRow>(
    `SELECT ${PHRASE_COLUMNS}
     FROM phrases p
     LEFT JOIN topics t ON t.id = p.topic_id
     ORDER BY p.id ASC`,
  );
  return rows.map(mapPhrase);
}

export async function getPhraseById(id: number): Promise<Phrase | null> {
  const row = await selectOne<PhraseRow>(
    `SELECT ${PHRASE_COLUMNS}
     FROM phrases p
     LEFT JOIN topics t ON t.id = p.topic_id
     WHERE p.id = $1`,
    [id],
  );
  return row ? mapPhrase(row) : null;
}

export async function listUnseenOrWrongPhrases(topicIds?: number[] | null): Promise<Phrase[]> {
  const userId = requireUserId();
  if (topicIds && topicIds.length > 0) {
    const placeholders = topicIds.map((_, index) => `$${index + 2}`).join(", ");
    const rows = await select<PhraseRow>(
      `SELECT ${PHRASE_COLUMNS}
       FROM phrases p
       LEFT JOIN topics t ON t.id = p.topic_id
       LEFT JOIN (
         SELECT content_id,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_n,
                SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_n,
                MAX(answered_at) AS last_at
         FROM study_sessions
         WHERE content_type = 'phrase' AND user_id = $1
         GROUP BY content_id
       ) s ON s.content_id = p.id
       WHERE p.topic_id IN (${placeholders})
       ORDER BY CASE WHEN s.content_id IS NULL THEN 0 WHEN s.wrong_n > 0 THEN 1 ELSE 2 END, s.last_at ASC, p.id ASC`,
      [userId, ...topicIds],
    );
    return rows.map(mapPhrase);
  }
  const rows = await select<PhraseRow>(
    `SELECT ${PHRASE_COLUMNS}
     FROM phrases p
     LEFT JOIN topics t ON t.id = p.topic_id
     LEFT JOIN (
       SELECT content_id,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_n,
              SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_n,
              MAX(answered_at) AS last_at
       FROM study_sessions
       WHERE content_type = 'phrase' AND user_id = $1
       GROUP BY content_id
     ) s ON s.content_id = p.id
     ORDER BY CASE WHEN s.content_id IS NULL THEN 0 WHEN s.wrong_n > 0 THEN 1 ELSE 2 END, s.last_at ASC, p.id ASC`,
    [userId],
  );
  return rows.map(mapPhrase);
}
