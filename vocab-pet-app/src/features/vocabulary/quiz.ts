import {
  getRandomMeanings,
  getRandomVocabulary,
  insertStudySession,
  updateLearningProgress,
} from "../../db";
import { rewardCorrectAnswer } from "../pet-state";
import type { AnswerResult, QuizQuestion } from "../../types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Builds a multiple-choice quiz from a random vocabulary item. */
export async function buildQuizQuestion(): Promise<QuizQuestion | null> {
  const vocabulary = await getRandomVocabulary();
  if (!vocabulary) {
    return null;
  }

  const distractors = await getRandomMeanings(vocabulary.id, 3);
  const options = shuffle([vocabulary.meaning, ...distractors]);
  const correctIndex = options.indexOf(vocabulary.meaning);

  return { vocabulary, options, correctIndex };
}

/** Records the answer, updates progress, pet XP, and study history. */
export async function submitAnswer(
  vocabularyId: number,
  selectedIndex: number,
  correctIndex: number,
): Promise<AnswerResult> {
  const isCorrect = selectedIndex === correctIndex;

  await updateLearningProgress(vocabularyId, isCorrect);
  await insertStudySession(vocabularyId, isCorrect);

  if (!isCorrect) {
    return {
      isCorrect: false,
      xpGained: 0,
      leveledUp: false,
      newLevel: 0,
    };
  }

  const { leveledUp, newLevel, xpGained } = await rewardCorrectAnswer();

  return {
    isCorrect: true,
    xpGained,
    leveledUp,
    newLevel,
  };
}

export { buildQuizQuestion as getQuizQuestion };
