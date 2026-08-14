import { DEFAULT_PET_NAME } from "../../constants/ui";
import { isoNow, todayDate, yesterdayDate } from "../../lib/dates";
import type { DailyMission, PetSpecies, PetState, TopicProgress, UserProgress } from "../../types";
import {
  countUniqueCorrect,
  getPetState,
  getStageForLevel,
  getUserProgress,
  insertPetState,
  lastSessionDate,
  listMissionsForDate,
  listPetSpecies,
  listStagesForSpecies,
  topicCorrectCounts,
  updatePetState,
  updateUserProgress,
} from "../../db";
import { moodFromLastFed } from "./mood";
import { nextStreakOnStudy, streakAfterIdle } from "./streak";
import { applyXpGain } from "./xp";

export { applyMissionProgress, ensureDailyMissions, missionCountsToward } from "./missions";
export { applyXpGain, xpProgressPercent } from "./xp";
export { moodFromLastFed } from "./mood";
export { nextStreakOnStudy, streakAfterIdle } from "./streak";

export async function listSpecies(): Promise<PetSpecies[]> {
  return listPetSpecies();
}

export async function getCurrentPet(): Promise<PetState | null> {
  return getPetState();
}

export async function adoptSpecies(
  species: PetSpecies,
  petName = DEFAULT_PET_NAME,
): Promise<PetState> {
  const stages = await listStagesForSpecies(species.id);
  const firstStage = stages[0];
  if (!firstStage) {
    throw new Error(`Species ${species.id} has no evolution stages`);
  }
  const now = isoNow();
  const resolvedName = petName.trim() || DEFAULT_PET_NAME;
  await insertPetState({
    petName: resolvedName,
    speciesId: species.id,
    stageId: firstStage.id,
    lastFedAt: now,
  });
  const pet = await getPetState();
  if (!pet) {
    throw new Error("Failed to create pet");
  }
  return pet;
}

async function persistPet(pet: PetState, extras?: Partial<PetState>): Promise<PetState> {
  const next: PetState = { ...pet, ...extras, updatedAt: isoNow() };
  await updatePetState({
    id: next.id,
    petName: next.petName,
    level: next.level,
    xp: next.xp,
    mood: next.mood,
    streakDays: next.streakDays,
    lastFedAt: next.lastFedAt,
    speciesId: next.speciesId,
    currentStageId: next.currentStageId,
    updatedAt: next.updatedAt,
  });
  const saved = await getPetState();
  if (!saved) {
    throw new Error("Pet state missing after update");
  }
  return saved;
}

export async function refreshMood(nowMs = Date.now()): Promise<PetState | null> {
  const pet = await getPetState();
  if (!pet) {
    return null;
  }
  const mood = moodFromLastFed(pet.lastFedAt, nowMs);
  if (mood === pet.mood) {
    return pet;
  }
  return persistPet(pet, { mood });
}

export async function markPetFed(fedAt = isoNow()): Promise<PetState> {
  const pet = await getPetState();
  if (!pet) {
    throw new Error("No pet to feed");
  }
  return persistPet(pet, { lastFedAt: fedAt, mood: "happy" });
}

export async function applyXpAndRefresh(gained: number): Promise<{ pet: PetState; leveledUp: boolean }> {
  const pet = await getPetState();
  if (!pet) {
    throw new Error("No pet to award XP");
  }
  const xpState = applyXpGain({ level: pet.level, xp: pet.xp }, gained);
  let currentStageId = pet.currentStageId;
  if (pet.speciesId) {
    const stage = await getStageForLevel(pet.speciesId, xpState.level);
    if (stage) {
      currentStageId = stage.id;
    }
  }
  const saved = await persistPet(pet, {
    level: xpState.level,
    xp: xpState.xp,
    currentStageId,
  });
  return { pet: saved, leveledUp: xpState.leveledUp };
}

export async function refreshUserProgress(
  now = new Date(),
  previousLastDate?: string | null,
): Promise<void> {
  const progress = await getUserProgress();
  if (!progress) {
    return;
  }
  const totalWordsLearned = await countUniqueCorrect("vocabulary");
  const totalPhrasesLearned = await countUniqueCorrect("phrase");
  const lastDate = previousLastDate === undefined ? await lastSessionDate() : previousLastDate;
  const today = todayDate(now);
  const yesterday = yesterdayDate(now);
  const currentStreak =
    previousLastDate === undefined
      ? streakAfterIdle(progress.currentStreak, lastDate, today, yesterday)
      : nextStreakOnStudy(progress.currentStreak, previousLastDate, today, yesterday);
  const longestStreak = Math.max(progress.longestStreak, currentStreak);
  const topicRows = await topicCorrectCounts();
  const progressByTopic: Record<string, TopicProgress> = {};
  for (const row of topicRows) {
    progressByTopic[row.topic] = { learned: row.learned, mastered: row.mastered };
  }
  await updateUserProgress({
    id: progress.id,
    totalWordsLearned,
    totalPhrasesLearned,
    currentStreak,
    longestStreak,
    progressByTopic,
    updatedAt: isoNow(now),
  });

  const pet = await getPetState();
  if (pet && pet.streakDays !== currentStreak) {
    await persistPet(pet, { streakDays: currentStreak });
  }
}

export async function todaysMissions(): Promise<DailyMission[]> {
  return listMissionsForDate(todayDate());
}

export async function getProgress(): Promise<UserProgress | null> {
  return getUserProgress();
}

export async function completeMissionXp(
  missions: DailyMission[],
): Promise<{ pet: PetState | null; leveledUp: boolean }> {
  let pet: PetState | null = await getPetState();
  let leveledUp = false;
  for (const mission of missions) {
    const result = await applyXpAndRefresh(mission.xpReward);
    pet = result.pet;
    leveledUp = leveledUp || result.leveledUp;
  }
  return { pet, leveledUp };
}
