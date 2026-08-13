import data from "./toeic-vocabulary.json";

export interface ToeicCardSeed {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleVi: string;
  imageKey: string;
  category: "TOEIC";
}

export const TOEIC_CARDS: ToeicCardSeed[] = data as ToeicCardSeed[];

export const TOEIC_ART_KEYS = [...new Set(TOEIC_CARDS.map((card) => card.imageKey))];
