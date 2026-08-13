import { isTauri } from "../lib/platform";
import { executeQuery, selectRows } from "./connection";
import {
  webGetPetState,
  webRefreshPetMood,
  webUpdatePetAfterAnswer,
  webUpdateStreak,
} from "./web-storage";
import type { PetMood, PetState } from "../types";

export async function getPetState(): Promise<PetState | null> {
  if (!isTauri()) {
    return webGetPetState();
  }
  const rows = await selectRows<PetState>(
    "SELECT * FROM pet_state ORDER BY id LIMIT 1",
  );
  return rows[0] ?? null;
}

export async function updatePetAfterAnswer(
  xpGained: number,
): Promise<{ leveledUp: boolean; newLevel: number }> {
  if (!isTauri()) {
    return webUpdatePetAfterAnswer(xpGained);
  }

  const pet = await getPetState();
  if (!pet) {
    return { leveledUp: false, newLevel: 1 };
  }

  let xp = pet.xp + xpGained;
  let level = pet.level;
  let leveledUp = false;
  const xpNeeded = level * 100;

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    leveledUp = true;
  }

  const now = new Date().toISOString();

  await executeQuery(
    `UPDATE pet_state
     SET xp = $1, level = $2, mood = 'happy', last_fed_at = $3, updated_at = $3
     WHERE id = $4`,
    [xp, level, now, pet.id],
  );

  return { leveledUp, newLevel: level };
}

/** Decays mood based on days since last study (last_fed_at). */
export async function refreshPetMood(): Promise<PetMood> {
  if (!isTauri()) {
    return webRefreshPetMood();
  }

  const pet = await getPetState();
  if (!pet) {
    return "happy";
  }

  const mood = computeMoodFromLastFed(pet.last_fed_at);
  if (mood !== pet.mood) {
    await executeQuery(
      "UPDATE pet_state SET mood = $1, updated_at = datetime('now') WHERE id = $2",
      [mood, pet.id],
    );
  }
  return mood;
}

function computeMoodFromLastFed(lastFedAt: string | null): PetMood {
  if (!lastFedAt) {
    return "hungry";
  }

  const lastFed = new Date(lastFedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastFed.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "happy";
  if (days === 1) return "neutral";
  if (days === 2) return "sad";
  return "hungry";
}

export async function updateStreak(): Promise<void> {
  if (!isTauri()) {
    return webUpdateStreak();
  }

  const pet = await getPetState();
  if (!pet?.last_fed_at) {
    return;
  }

  const lastFed = new Date(pet.last_fed_at);
  const today = new Date();
  const lastFedDay = startOfDay(lastFed).getTime();
  const todayDay = startOfDay(today).getTime();
  const dayDiff = (todayDay - lastFedDay) / (1000 * 60 * 60 * 24);

  if (dayDiff === 1) {
    await executeQuery(
      "UPDATE pet_state SET streak_days = streak_days + 1 WHERE id = $1",
      [pet.id],
    );
  } else if (dayDiff > 1) {
    await executeQuery(
      "UPDATE pet_state SET streak_days = 1 WHERE id = $1",
      [pet.id],
    );
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
