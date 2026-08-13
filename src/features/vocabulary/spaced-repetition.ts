import { MASTERED_CORRECT_THRESHOLD } from "../../constants/study";
import type { LearningStatus } from "../../types";

const INTERVAL_DAYS = [1, 1, 3, 7, 14];

export function nextIntervalDays(correctCount: number, wasCorrect: boolean): number {
  if (!wasCorrect) {
    return 0;
  }
  const index = Math.min(Math.max(correctCount - 1, 0), INTERVAL_DAYS.length - 1);
  return INTERVAL_DAYS[index] ?? 1;
}

export function nextStatus(correctCount: number, wasCorrect: boolean): LearningStatus {
  if (!wasCorrect) {
    return correctCount > 0 ? "learning" : "new";
  }
  if (correctCount >= MASTERED_CORRECT_THRESHOLD) {
    return "mastered";
  }
  return "learning";
}

export function applyReview(input: {
  correctCount: number;
  wrongCount: number;
  wasCorrect: boolean;
}): { correctCount: number; wrongCount: number; status: LearningStatus; intervalDays: number } {
  const correctCount = input.wasCorrect ? input.correctCount + 1 : input.correctCount;
  const wrongCount = input.wasCorrect ? input.wrongCount : input.wrongCount + 1;
  return {
    correctCount,
    wrongCount,
    status: nextStatus(correctCount, input.wasCorrect),
    intervalDays: nextIntervalDays(correctCount, input.wasCorrect),
  };
}
