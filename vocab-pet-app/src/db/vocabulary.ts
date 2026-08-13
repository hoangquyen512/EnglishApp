import { executeQuery, selectRows } from "./connection";
import type { LearningProgress, Vocabulary } from "../types";

export async function getAllVocabulary(): Promise<Vocabulary[]> {
  return selectRows<Vocabulary>("SELECT * FROM vocabulary ORDER BY id");
}

export async function getVocabularyById(id: number): Promise<Vocabulary | null> {
  const rows = await selectRows<Vocabulary>(
    "SELECT * FROM vocabulary WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function getDueVocabulary(): Promise<Vocabulary[]> {
  return selectRows<Vocabulary>(
    `SELECT v.* FROM vocabulary v
     LEFT JOIN learning_progress lp ON lp.vocabulary_id = v.id
     WHERE lp.next_review_at IS NULL OR lp.next_review_at <= datetime('now')
     ORDER BY RANDOM()
     LIMIT 1`,
  );
}

export async function getRandomVocabulary(): Promise<Vocabulary | null> {
  const rows = await selectRows<Vocabulary>(
    "SELECT * FROM vocabulary ORDER BY RANDOM() LIMIT 1",
  );
  return rows[0] ?? null;
}

export async function getRandomMeanings(
  excludeId: number,
  count: number,
): Promise<string[]> {
  const rows = await selectRows<{ meaning: string }>(
    `SELECT meaning FROM vocabulary
     WHERE id != $1
     ORDER BY RANDOM()
     LIMIT $2`,
    [excludeId, count],
  );
  return rows.map((row) => row.meaning);
}

export async function getLearningProgress(
  vocabularyId: number,
): Promise<LearningProgress | null> {
  const rows = await selectRows<LearningProgress>(
    "SELECT * FROM learning_progress WHERE vocabulary_id = $1",
    [vocabularyId],
  );
  return rows[0] ?? null;
}

export async function updateLearningProgress(
  vocabularyId: number,
  isCorrect: boolean,
): Promise<void> {
  const now = new Date().toISOString();
  const progress = await getLearningProgress(vocabularyId);

  if (!progress) {
    return;
  }

  if (isCorrect) {
    const correctCount = progress.correct_count + 1;
    const status =
      correctCount >= 5 ? "mastered" : correctCount >= 1 ? "learning" : "new";
    const daysToAdd = Math.min(correctCount, 7);

    await executeQuery(
      `UPDATE learning_progress
       SET correct_count = $1,
           last_reviewed_at = $2,
           next_review_at = datetime('now', '+' || $3 || ' days'),
           status = $4
       WHERE vocabulary_id = $5`,
      [correctCount, now, daysToAdd, status, vocabularyId],
    );
  } else {
    const wrongCount = progress.wrong_count + 1;
    await executeQuery(
      `UPDATE learning_progress
       SET wrong_count = $1,
           last_reviewed_at = $2,
           next_review_at = datetime('now', '+1 day'),
           status = 'learning'
       WHERE vocabulary_id = $3`,
      [wrongCount, now, vocabularyId],
    );
  }
}

export async function insertStudySession(
  vocabularyId: number,
  isCorrect: boolean,
): Promise<void> {
  await executeQuery(
    "INSERT INTO study_sessions (vocabulary_id, is_correct) VALUES ($1, $2)",
    [vocabularyId, isCorrect ? 1 : 0],
  );
}
