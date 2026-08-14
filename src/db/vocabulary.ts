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

const VOCAB_COLUMNS =
  "id, word, meaning, example, example_vi, phonetic, part_of_speech, image_key, category, created_at";

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
    `SELECT ${VOCAB_COLUMNS} FROM vocabulary ORDER BY id ASC`,
  );
  return rows.map(mapVocab);
}

export async function getVocabularyById(id: number): Promise<Vocabulary | null> {
  const row = await selectOne<VocabularyRow>(
    `SELECT ${VOCAB_COLUMNS} FROM vocabulary WHERE id = $1`,
    [id],
  );
  return row ? mapVocab(row) : null;
}

export async function getDueOrNewVocabulary(nowIso: string): Promise<Vocabulary[]> {
  const userId = requireUserId();
  const rows = await select<VocabularyRow>(
    `SELECT v.id, v.word, v.meaning, v.example, v.example_vi, v.phonetic, v.part_of_speech, v.image_key, v.category, v.created_at
     FROM vocabulary v
     LEFT JOIN learning_progress p ON p.vocabulary_id = v.id AND p.user_id = $2
     WHERE p.id IS NULL OR p.next_review_at IS NULL OR p.next_review_at <= $1
     ORDER BY CASE WHEN p.status = 'new' OR p.id IS NULL THEN 0 ELSE 1 END, p.next_review_at ASC, v.id ASC`,
    [nowIso, userId],
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
