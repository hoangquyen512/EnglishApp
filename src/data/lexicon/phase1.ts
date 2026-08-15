import type { TopicCode } from "../../features/learning-program/catalog";
import { DEFAULT_ACTIVE_TOPIC_CODES } from "../../features/learning-program/catalog";

export const CONTENT_VERSION = "2026-08-15-phase1";

export const PHASE1_TOPIC_CODES: TopicCode[] = [...DEFAULT_ACTIVE_TOPIC_CODES];

export type VocabSeed = {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleVi: string;
  imageKey: string;
};

export type PhraseSeed = {
  id: string;
  en: string;
  vi: string;
  level: "A1" | "A2" | "B1" | "B2";
  ipa: string;
};

import familyVocab from "./vocabulary/family.json";
import foodVocab from "./vocabulary/food_dining.json";
import officeVocab from "./vocabulary/office_work.json";
import travelVocab from "./vocabulary/travel.json";
import familyPhrases from "./phrases/family.json";
import foodPhrases from "./phrases/food_dining.json";
import officePhrases from "./phrases/office_work.json";
import travelPhrases from "./phrases/travel.json";

export const PHASE1_VOCABULARY: Record<string, VocabSeed[]> = {
  family: familyVocab as VocabSeed[],
  food_dining: foodVocab as VocabSeed[],
  office_work: officeVocab as VocabSeed[],
  travel: travelVocab as VocabSeed[],
};

export const PHASE1_PHRASES: Record<string, PhraseSeed[]> = {
  family: familyPhrases as PhraseSeed[],
  food_dining: foodPhrases as PhraseSeed[],
  office_work: officePhrases as PhraseSeed[],
  travel: travelPhrases as PhraseSeed[],
};
