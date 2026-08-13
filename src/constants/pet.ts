import type { PetMood } from "../types";

export const XP_PER_LEVEL = 50;
export const CORRECT_ANSWER_XP = 5;

export const SPRITE_EMOJI: Record<string, string> = {
  cat_egg: "🥚",
  cat_young: "🐱",
  cat_adult: "🐈",
  fox_egg: "🥚",
  fox_young: "🦊",
  fox_adult: "🦊",
  dragon_egg: "🥚",
  dragon_young: "🐲",
  dragon_adult: "🐉",
};

export const MOOD_EMOJI: Record<PetMood, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  hungry: "🍽️",
};

export const MOOD_SEQUENCE: PetMood[] = ["happy", "neutral", "sad", "hungry"];
