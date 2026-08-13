import type { DailyMission, PetSpecies, PetState } from "../types";

export const DEMO_PET: PetState = {
  id: 1,
  petName: "Mochi",
  level: 2,
  xp: 18,
  mood: "happy",
  streakDays: 3,
  lastFedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  speciesId: 1,
  currentStageId: 2,
  spriteKey: "cat_young",
  speciesName: "Mèo",
};

export const DEMO_SPECIES: PetSpecies[] = [
  { id: 1, speciesName: "Mèo", description: "Êm dịu, thích ngồi cạnh thẻ từ vựng." },
  { id: 2, speciesName: "Cáo", description: "Nhanh nhẹn, nhớ từ rất nhanh." },
  { id: 3, speciesName: "Rồng", description: "Kiên nhẫn, đồng hành cùng bạn mỗi ngày." },
];

export const DEMO_MISSIONS: DailyMission[] = [
  {
    id: 1,
    missionDate: new Date().toISOString().slice(0, 10),
    missionType: "learn_new",
    targetCount: 10,
    currentCount: 3,
    topic: null,
    xpReward: 15,
    isCompleted: false,
  },
  {
    id: 2,
    missionDate: new Date().toISOString().slice(0, 10),
    missionType: "review_wrong",
    targetCount: 5,
    currentCount: 1,
    topic: null,
    xpReward: 10,
    isCompleted: false,
  },
  {
    id: 3,
    missionDate: new Date().toISOString().slice(0, 10),
    missionType: "topic_practice",
    targetCount: 3,
    currentCount: 0,
    topic: "office",
    xpReward: 12,
    isCompleted: false,
  },
];
