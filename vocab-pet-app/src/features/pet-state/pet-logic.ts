import { PET_CONFIG } from "../../constants/ui-strings";
import { getPetState, refreshPetMood, updatePetAfterAnswer, updateStreak } from "../../db";
import type { PetMood, PetState } from "../../types";

export interface PetSnapshot {
  pet: PetState;
  mood: PetMood;
  xpToNextLevel: number;
  xpProgressPercent: number;
}

/** Loads pet state and applies mood decay rules. */
export async function loadPetSnapshot(): Promise<PetSnapshot | null> {
  const mood = await refreshPetMood();
  const pet = await getPetState();
  if (!pet) {
    return null;
  }

  const xpNeeded = PET_CONFIG.xpForLevel(pet.level);
  const xpProgressPercent = Math.min(100, Math.round((pet.xp / xpNeeded) * 100));

  return {
    pet: { ...pet, mood },
    mood,
    xpToNextLevel: xpNeeded - pet.xp,
    xpProgressPercent,
  };
}

/** Applies XP reward after a correct flashcard answer. */
export async function rewardCorrectAnswer(): Promise<{
  leveledUp: boolean;
  newLevel: number;
  xpGained: number;
}> {
  const { leveledUp, newLevel } = await updatePetAfterAnswer(PET_CONFIG.xpPerCorrect);
  await updateStreak();
  return { leveledUp, newLevel, xpGained: PET_CONFIG.xpPerCorrect };
}

export { refreshPetMood };
