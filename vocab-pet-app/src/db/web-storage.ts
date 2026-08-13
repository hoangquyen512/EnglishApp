import type { LearningProgress, PetMood, PetState, Vocabulary } from "../types";
import {
  createSeedDatabase,
  type WebDatabaseSnapshot,
} from "./seed-data";

const STORAGE_KEY = "vocab-pet-web-db";

function loadSnapshot(): WebDatabaseSnapshot {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = createSeedDatabase();
    saveSnapshot(seeded);
    return seeded;
  }
  return JSON.parse(raw) as WebDatabaseSnapshot;
}

function saveSnapshot(snapshot: WebDatabaseSnapshot): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function computeMoodFromLastFed(lastFedAt: string | null): PetMood {
  if (!lastFedAt) {
    return "hungry";
  }

  const lastFed = new Date(lastFedAt);
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days <= 0) return "happy";
  if (days === 1) return "neutral";
  if (days === 2) return "sad";
  return "hungry";
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Initializes or resets browser localStorage database. */
export function initWebDatabase(): void {
  loadSnapshot();
}

export async function webGetAllVocabulary(): Promise<Vocabulary[]> {
  const db = loadSnapshot();
  return [...db.vocabulary].sort((a, b) => a.id - b.id);
}

export async function webGetRandomVocabulary(): Promise<Vocabulary | null> {
  const db = loadSnapshot();
  if (db.vocabulary.length === 0) {
    return null;
  }
  return shuffle(db.vocabulary)[0] ?? null;
}

export async function webGetRandomMeanings(
  excludeId: number,
  count: number,
): Promise<string[]> {
  const db = loadSnapshot();
  return shuffle(db.vocabulary.filter((item) => item.id !== excludeId))
    .slice(0, count)
    .map((item) => item.meaning);
}

export async function webGetLearningProgress(
  vocabularyId: number,
): Promise<LearningProgress | null> {
  const db = loadSnapshot();
  return (
    db.learning_progress.find((item) => item.vocabulary_id === vocabularyId) ??
    null
  );
}

export async function webUpdateLearningProgress(
  vocabularyId: number,
  isCorrect: boolean,
): Promise<void> {
  const db = loadSnapshot();
  const progress = db.learning_progress.find(
    (item) => item.vocabulary_id === vocabularyId,
  );
  if (!progress) {
    return;
  }

  const now = new Date().toISOString();
  if (isCorrect) {
    progress.correct_count += 1;
    progress.last_reviewed_at = now;
    progress.next_review_at = addDaysIso(Math.min(progress.correct_count, 7));
    progress.status =
      progress.correct_count >= 5
        ? "mastered"
        : progress.correct_count >= 1
          ? "learning"
          : "new";
  } else {
    progress.wrong_count += 1;
    progress.last_reviewed_at = now;
    progress.next_review_at = addDaysIso(1);
    progress.status = "learning";
  }

  saveSnapshot(db);
}

export async function webInsertStudySession(
  vocabularyId: number,
  isCorrect: boolean,
): Promise<void> {
  const db = loadSnapshot();
  db.nextSessionId += 1;
  saveSnapshot(db);
  void vocabularyId;
  void isCorrect;
}

export async function webGetPetState(): Promise<PetState | null> {
  const db = loadSnapshot();
  return db.pet_state[0] ?? null;
}

export async function webUpdatePetAfterAnswer(
  xpGained: number,
): Promise<{ leveledUp: boolean; newLevel: number }> {
  const db = loadSnapshot();
  const pet = db.pet_state[0];
  if (!pet) {
    return { leveledUp: false, newLevel: 1 };
  }

  let xp = pet.xp + xpGained;
  let level = pet.level;
  let leveledUp = false;
  let xpNeeded = level * 100;

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    leveledUp = true;
    xpNeeded = level * 100;
  }

  const now = new Date().toISOString();
  pet.xp = xp;
  pet.level = level;
  pet.mood = "happy";
  pet.last_fed_at = now;
  pet.updated_at = now;
  saveSnapshot(db);

  return { leveledUp, newLevel: level };
}

export async function webRefreshPetMood(): Promise<PetMood> {
  const db = loadSnapshot();
  const pet = db.pet_state[0];
  if (!pet) {
    return "happy";
  }

  const mood = computeMoodFromLastFed(pet.last_fed_at);
  if (pet.mood !== mood) {
    pet.mood = mood;
    pet.updated_at = new Date().toISOString();
    saveSnapshot(db);
  }
  return mood;
}

export async function webUpdateStreak(): Promise<void> {
  const db = loadSnapshot();
  const pet = db.pet_state[0];
  if (!pet?.last_fed_at) {
    return;
  }

  const lastFedDay = startOfDay(new Date(pet.last_fed_at)).getTime();
  const todayDay = startOfDay(new Date()).getTime();
  const dayDiff = (todayDay - lastFedDay) / (1000 * 60 * 60 * 24);

  if (dayDiff === 1) {
    pet.streak_days += 1;
  } else if (dayDiff > 1) {
    pet.streak_days = 1;
  }

  saveSnapshot(db);
}
