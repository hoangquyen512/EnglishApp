export type ContentType = "vocabulary" | "phrase" | "conversation";

export type { TopicCode as ConversationTopicId } from "../features/learning-program/catalog";
export type { TopicCode } from "../features/learning-program/catalog";

export type LearningStatus = "new" | "learning" | "mastered";

export type PetMood = "happy" | "neutral" | "sad" | "hungry";

export type MissionType = "learn_new" | "review_wrong" | "topic_practice";

export type CefrLevel = "A1" | "A2" | "B1" | "B2";

export type FlashcardOutcome = "viewed" | "known" | "unknown";

export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  example: string | null;
  exampleVi: string | null;
  phonetic: string | null;
  partOfSpeech: string | null;
  imageKey: string | null;
  category: string | null;
  topicId: number | null;
  topic: string | null;
  createdAt: string;
}

export interface Phrase {
  id: number;
  phraseEn: string;
  meaningVi: string;
  topic: string;
  topicId: number | null;
  level: CefrLevel;
  createdAt: string;
}

export interface LearningProgress {
  id: number;
  vocabularyId: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  status: LearningStatus;
}

export interface PetSpecies {
  id: number;
  speciesName: string;
  description: string | null;
}

export interface PetEvolutionStage {
  id: number;
  speciesId: number;
  stageOrder: number;
  minLevel: number;
  spriteKey: string;
}

export interface PetState {
  id: number;
  petName: string;
  level: number;
  xp: number;
  mood: PetMood;
  streakDays: number;
  lastFedAt: string | null;
  updatedAt: string;
  speciesId: number | null;
  currentStageId: number | null;
  spriteKey: string | null;
  speciesName: string | null;
}

export interface DailyMission {
  id: number;
  missionDate: string;
  missionType: MissionType;
  targetCount: number;
  currentCount: number;
  topic: string | null;
  topicId: number | null;
  xpReward: number;
  isCompleted: boolean;
}

export interface TopicProgress {
  learned: number;
  mastered: number;
}

export interface UserProgress {
  id: number;
  totalWordsLearned: number;
  totalPhrasesLearned: number;
  currentStreak: number;
  longestStreak: number;
  progressByTopic: Record<string, TopicProgress>;
  updatedAt: string;
}

export interface StudyFlashcard {
  contentId: number;
  contentType: ContentType;
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  meaning: string;
  example: string | null;
  exampleVi: string | null;
  imageKey: string;
  topic: string | null;
}

export interface StudyMode {
  contentType: ContentType;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  outcome: FlashcardOutcome;
  xpGained: number;
  leveledUp: boolean;
  completedMissions: DailyMission[];
  pet: PetState | null;
}
