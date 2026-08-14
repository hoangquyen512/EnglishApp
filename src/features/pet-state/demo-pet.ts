import { DEFAULT_PET_NAME } from "../../constants/ui";
import { DEMO_SPECIES } from "../../data/demo-pet";
import type { PetEvolutionStage, PetSpecies, PetState } from "../../types";

/** Mirrors src-tauri/migrations/015_seed_stages.sql for browser demo. */
export const DEMO_STAGES: PetEvolutionStage[] = [
  { id: 1, speciesId: 1, stageOrder: 1, minLevel: 1, spriteKey: "cat_egg" },
  { id: 2, speciesId: 1, stageOrder: 2, minLevel: 3, spriteKey: "cat_young" },
  { id: 3, speciesId: 1, stageOrder: 3, minLevel: 6, spriteKey: "cat_adult" },
  { id: 4, speciesId: 2, stageOrder: 1, minLevel: 1, spriteKey: "fox_egg" },
  { id: 5, speciesId: 2, stageOrder: 2, minLevel: 3, spriteKey: "fox_young" },
  { id: 6, speciesId: 2, stageOrder: 3, minLevel: 6, spriteKey: "fox_adult" },
  { id: 7, speciesId: 3, stageOrder: 1, minLevel: 1, spriteKey: "dragon_egg" },
  { id: 8, speciesId: 3, stageOrder: 2, minLevel: 3, spriteKey: "dragon_young" },
  { id: 9, speciesId: 3, stageOrder: 3, minLevel: 6, spriteKey: "dragon_adult" },
];

export function demoStageForLevel(
  speciesId: number,
  level: number,
): PetEvolutionStage | null {
  const stages = DEMO_STAGES.filter((stage) => stage.speciesId === speciesId && stage.minLevel <= level).sort(
    (a, b) => b.minLevel - a.minLevel || b.stageOrder - a.stageOrder,
  );
  return stages[0] ?? null;
}

export function buildAdoptedDemoPet(species: PetSpecies, petName?: string): PetState {
  const now = new Date().toISOString();
  const stage = demoStageForLevel(species.id, 1);
  if (!stage) {
    throw new Error(`Species ${species.id} has no evolution stages`);
  }
  return {
    id: 1,
    petName: petName?.trim() || DEFAULT_PET_NAME,
    level: 1,
    xp: 0,
    mood: "happy",
    streakDays: 0,
    lastFedAt: now,
    updatedAt: now,
    speciesId: species.id,
    currentStageId: stage.id,
    spriteKey: stage.spriteKey,
    speciesName: species.speciesName,
  };
}

export function alignPetToSpecies(
  pet: PetState,
  speciesList: PetSpecies[] = DEMO_SPECIES,
): PetState {
  if (!pet.speciesId) {
    return pet;
  }
  const species = speciesList.find((item) => item.id === pet.speciesId);
  const stage = demoStageForLevel(pet.speciesId, pet.level);
  if (!species || !stage) {
    return pet;
  }
  if (
    pet.spriteKey === stage.spriteKey &&
    pet.currentStageId === stage.id &&
    pet.speciesName === species.speciesName
  ) {
    return pet;
  }
  return {
    ...pet,
    speciesName: species.speciesName,
    currentStageId: stage.id,
    spriteKey: stage.spriteKey,
  };
}

export function applyPetProfileChange(
  pet: PetState,
  input: { petName?: string; speciesId?: number },
  speciesList: PetSpecies[] = DEMO_SPECIES,
): PetState {
  const speciesId = input.speciesId ?? pet.speciesId;
  const species =
    speciesId != null ? speciesList.find((item) => item.id === speciesId) : null;
  const nextName = input.petName !== undefined ? input.petName.trim() || DEFAULT_PET_NAME : pet.petName;
  const next: PetState = {
    ...pet,
    petName: nextName,
    speciesId: speciesId,
    speciesName: species?.speciesName ?? pet.speciesName,
    updatedAt: new Date().toISOString(),
  };
  return alignPetToSpecies(next, speciesList);
}
