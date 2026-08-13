import { MOOD_SEQUENCE } from "../../constants/pet";
import { daysBetween } from "../../lib/dates";
import type { PetMood } from "../../types";

export function moodFromLastFed(lastFedAt: string | null, nowMs = Date.now()): PetMood {
  if (!lastFedAt) {
    return "happy";
  }
  const idleDays = daysBetween(lastFedAt, nowMs);
  const index = Math.min(Math.max(idleDays, 0), MOOD_SEQUENCE.length - 1);
  return MOOD_SEQUENCE[index] ?? "hungry";
}
