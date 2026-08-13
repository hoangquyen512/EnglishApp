import { CORRECT_ANSWER_XP, VIEWED_CARD_XP } from "../../constants/pet";
import type { FlashcardOutcome } from "../../types";

export function xpForOutcome(outcome: FlashcardOutcome): number {
  if (outcome === "known") {
    return CORRECT_ANSWER_XP;
  }
  if (outcome === "viewed") {
    return VIEWED_CARD_XP;
  }
  return 0;
}

export function countsTowardMastery(outcome: FlashcardOutcome): boolean {
  return outcome === "known";
}

export function sessionIsCorrect(outcome: FlashcardOutcome): boolean {
  return outcome !== "unknown";
}
