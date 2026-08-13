import type { LearningProgress, PetState, Vocabulary } from "../types";

export interface SeedVocabularyItem {
  word: string;
  meaning: string;
  example: string;
  category: string;
}

/** Default vocabulary used on first launch (web + desktop). */
export const SEED_VOCABULARY: SeedVocabularyItem[] = [
  {
    word: "apple",
    meaning: "a round fruit with red or green skin",
    example: "I eat an apple every day.",
    category: "food",
  },
  {
    word: "book",
    meaning: "a set of printed pages bound together",
    example: "She is reading a book.",
    category: "objects",
  },
  {
    word: "water",
    meaning: "a clear liquid essential for life",
    example: "Drink more water every day.",
    category: "nature",
  },
  {
    word: "happy",
    meaning: "feeling pleasure or contentment",
    example: "I feel happy when I learn new words.",
    category: "emotions",
  },
  {
    word: "run",
    meaning: "to move quickly on foot",
    example: "They run in the park every morning.",
    category: "actions",
  },
  {
    word: "house",
    meaning: "a building where people live",
    example: "Our house has a small garden.",
    category: "places",
  },
  {
    word: "friend",
    meaning: "a person you know and like",
    example: "My friend helps me study English.",
    category: "people",
  },
  {
    word: "learn",
    meaning: "to gain knowledge or skill",
    example: "We learn something new every day.",
    category: "actions",
  },
  {
    word: "morning",
    meaning: "the early part of the day",
    example: "Good morning! Time to study.",
    category: "time",
  },
  {
    word: "beautiful",
    meaning: "pleasing to the senses or mind",
    example: "What a beautiful day!",
    category: "adjectives",
  },
];

export interface WebDatabaseSnapshot {
  vocabulary: Vocabulary[];
  learning_progress: LearningProgress[];
  pet_state: PetState[];
  nextVocabularyId: number;
  nextProgressId: number;
  nextPetId: number;
  nextSessionId: number;
}

export function createSeedDatabase(now = new Date().toISOString()): WebDatabaseSnapshot {
  const vocabulary: Vocabulary[] = SEED_VOCABULARY.map((item, index) => ({
    id: index + 1,
    word: item.word,
    meaning: item.meaning,
    example: item.example,
    category: item.category,
    created_at: now,
  }));

  const learning_progress: LearningProgress[] = vocabulary.map((item) => ({
    id: item.id,
    vocabulary_id: item.id,
    correct_count: 0,
    wrong_count: 0,
    last_reviewed_at: null,
    next_review_at: null,
    status: "new",
  }));

  const pet_state: PetState[] = [
    {
      id: 1,
      pet_name: "Pet",
      level: 1,
      xp: 0,
      mood: "happy",
      streak_days: 0,
      last_fed_at: now,
      updated_at: now,
    },
  ];

  return {
    vocabulary,
    learning_progress,
    pet_state,
    nextVocabularyId: vocabulary.length + 1,
    nextProgressId: vocabulary.length + 1,
    nextPetId: 2,
    nextSessionId: 1,
  };
}
