import type { LearningProgress, LearningStatus, Vocabulary } from "../types";
import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";

interface VocabularyRow {
  id: number;
  word: string;
  meaning: string;
  example: string | null;
  example_vi: string | null;
  phonetic: string | null;
  part_of_speech: string | null;
  image_key: string | null;
  category: string | null;
  topic_id: number | null;
  topic_code: string | null;
  created_at: string;
}

interface ProgressRow {
  id: number;
  vocabulary_id: number;
  correct_count: number;
  wrong_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  status: LearningStatus;
}

const VOCAB_COLUMNS = `v.id, v.word, v.meaning, v.example, v.example_vi, v.phonetic, v.part_of_speech,
  v.image_key, v.category, v.topic_id, t.code AS topic_code, v.created_at`;

function mapVocab(row: VocabularyRow): Vocabulary {
  return {
    id: row.id,
    word: row.word,
    meaning: row.meaning,
    example: row.example,
    exampleVi: row.example_vi,
    phonetic: row.phonetic,
    partOfSpeech: row.part_of_speech,
    imageKey: row.image_key,
    category: row.category,
    topicId: row.topic_id,
    topic: row.topic_code,
    createdAt: row.created_at,
  };
}

function mapProgress(row: ProgressRow): LearningProgress {
  return {
    id: row.id,
    vocabularyId: row.vocabulary_id,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
    status: row.status,
  };
}

export async function listVocabulary(): Promise<Vocabulary[]> {
  const rows = await select<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS}
     FROM vocabulary v
     LEFT JOIN topics t ON t.id = v.topic_id
     ORDER BY v.id ASC`,
  );
  return rows.map(mapVocab);
}

export async function listVocabularyByTopicIds(topicIds: number[]): Promise<Vocabulary[]> {
  if (topicIds.length === 0) {
    return [];
  }
  const placeholders = topicIds.map((_, index) => `$${index + 1}`).join(", ");
  const rows = await select<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS}
     FROM vocabulary v
     LEFT JOIN topics t ON t.id = v.topic_id
     WHERE v.topic_id IN (${placeholders})
     ORDER BY v.id ASC`,
    topicIds,
  );
  return rows.map(mapVocab);
}

export async function getVocabularyById(id: number): Promise<Vocabulary | null> {
  const row = await selectOne<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS}
     FROM vocabulary v
     LEFT JOIN topics t ON t.id = v.topic_id
     WHERE v.id = $1`,
    [id],
  );
  return row ? mapVocab(row) : null;
}

export async function getDueOrNewVocabulary(nowIso: string): Promise<Vocabulary[]> {
  const userId = requireUserId();
  const rows = await select<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS}
     FROM vocabulary v
     LEFT JOIN topics t ON t.id = v.topic_id
     LEFT JOIN learning_progress p ON p.vocabulary_id = v.id AND p.user_id = $2
     WHERE p.id IS NULL OR p.next_review_at IS NULL OR p.next_review_at <= $1
     ORDER BY CASE WHEN p.status = 'new' OR p.id IS NULL THEN 0 ELSE 1 END, p.next_review_at ASC, v.id ASC`,
    [nowIso, userId],
  );
  return rows.map(mapVocab);
}

export async function getDueOrNewVocabularyByTopicIds(
  nowIso: string,
  topicIds: number[],
): Promise<Vocabulary[]> {
  if (topicIds.length === 0) {
    return [];
  }
  const userId = requireUserId();
  const placeholders = topicIds.map((_, index) => `$${index + 3}`).join(", ");
  const rows = await select<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS}
     FROM vocabulary v
     LEFT JOIN topics t ON t.id = v.topic_id
     LEFT JOIN learning_progress p ON p.vocabulary_id = v.id AND p.user_id = $2
     WHERE v.topic_id IN (${placeholders})
       AND (p.id IS NULL OR p.next_review_at IS NULL OR p.next_review_at <= $1)
     ORDER BY CASE WHEN p.status = 'new' OR p.id IS NULL THEN 0 ELSE 1 END, p.next_review_at ASC, v.id ASC`,
    [nowIso, userId, ...topicIds],
  );
  return rows.map(mapVocab);
}

export async function getLearningProgress(
  vocabularyId: number,
): Promise<LearningProgress | null> {
  const userId = requireUserId();
  const row = await selectOne<ProgressRow>(
    `SELECT id, vocabulary_id, correct_count, wrong_count, last_reviewed_at, next_review_at, status
     FROM learning_progress WHERE vocabulary_id = $1 AND user_id = $2`,
    [vocabularyId, userId],
  );
  return row ? mapProgress(row) : null;
}

export async function upsertLearningProgress(input: {
  vocabularyId: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  status: LearningStatus;
}): Promise<void> {
  const userId = requireUserId();
  const existing = await getLearningProgress(input.vocabularyId);
  if (existing) {
    await execute(
      `UPDATE learning_progress
       SET correct_count = $1, wrong_count = $2, last_reviewed_at = $3, next_review_at = $4, status = $5
       WHERE vocabulary_id = $6 AND user_id = $7`,
      [
        input.correctCount,
        input.wrongCount,
        input.lastReviewedAt,
        input.nextReviewAt,
        input.status,
        input.vocabularyId,
        userId,
      ],
    );
    return;
  }
  await execute(
    `INSERT INTO learning_progress
      (vocabulary_id, correct_count, wrong_count, last_reviewed_at, next_review_at, status, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.vocabularyId,
      input.correctCount,
      input.wrongCount,
      input.lastReviewedAt,
      input.nextReviewAt,
      input.status,
      userId,
    ],
  );
}

export async function countLearnedVocabulary(): Promise<number> {
  const userId = requireUserId();
  const row = await selectOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM learning_progress WHERE status IN ('learning', 'mastered') AND user_id = $1`,
    [userId],
  );
  return row?.count ?? 0;
}

export async function insertVocabulary(input: {
  word: string;
  meaning: string;
  example?: string | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  topicId?: number | null;
}): Promise<Vocabulary> {
  await execute(
    `INSERT INTO vocabulary (word, meaning, example, phonetic, part_of_speech, category, topic_id)
     VALUES ($1, $2, $3, $4, $5, 'lookup', $6)
     ON CONFLICT(word) DO UPDATE SET
       meaning = excluded.meaning,
       example = COALESCE(excluded.example, vocabulary.example),
       phonetic = COALESCE(excluded.phonetic, vocabulary.phonetic),
       part_of_speech = COALESCE(excluded.part_of_speech, vocabulary.part_of_speech),
       topic_id = COALESCE(excluded.topic_id, vocabulary.topic_id)`,
    [
      input.word,
      input.meaning,
      input.example ?? null,
      input.phonetic ?? null,
      input.partOfSpeech ?? null,
      input.topicId ?? null,
    ],
  );
  const row = await selectOne<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS}
     FROM vocabulary v
     LEFT JOIN topics t ON t.id = v.topic_id
     WHERE v.word = $1`,
    [input.word],
  );
  if (!row) {
    throw new Error("Failed to insert vocabulary");
  }
  return mapVocab(row);
}
