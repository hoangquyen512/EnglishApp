import type { PetMood } from "../types";

export const XP_PER_LEVEL = 50;
export const CORRECT_ANSWER_XP = 5;
export const VIEWED_CARD_XP = 2;

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

/** PNG basename under /pets (no extension), keyed by sprite_key. */
export const SPRITE_ART: Record<string, string> = {
  cat_egg: "cat-egg",
  cat_young: "cat-young",
  cat_adult: "cat-adult",
  fox_egg: "fox-egg",
  fox_young: "fox-young",
  fox_adult: "fox-adult",
  dragon_egg: "dragon-egg",
  dragon_young: "dragon-young",
  dragon_adult: "dragon-adult",
};

/** Onboarding preview art (adult form) keyed by species id. */
export const SPECIES_PREVIEW_ART: Record<number, string> = {
  1: "cat-adult",
  2: "fox-adult",
  3: "dragon-adult",
};

export const MOOD_EMOJI: Record<PetMood, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  hungry: "🍽️",
};

export const MOOD_SEQUENCE: PetMood[] = ["happy", "neutral", "sad", "hungry"];
