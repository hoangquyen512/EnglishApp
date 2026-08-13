export type LearningStatus = "new" | "learning" | "mastered";

export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  example: string | null;
  category: string | null;
  created_at: string;
}

export interface LearningProgress {
  id: number;
  vocabulary_id: number;
  correct_count: number;
  wrong_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  status: LearningStatus;
}

export type PetMood = "happy" | "neutral" | "sad" | "hungry";

export interface PetState {
  id: number;
  pet_name: string;
  level: number;
  xp: number;
  mood: PetMood;
  streak_days: number;
  last_fed_at: string | null;
  updated_at: string;
}

export interface StudySession {
  id: number;
  vocabulary_id: number;
  is_correct: number;
  answered_at: string;
}

export interface QuizQuestion {
  vocabulary: Vocabulary;
  options: string[];
  correctIndex: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
}
