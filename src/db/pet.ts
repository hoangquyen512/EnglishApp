import type { PetEvolutionStage, PetMood, PetSpecies, PetState } from "../types";
import { execute, select, selectOne } from "./client";

interface SpeciesRow {
  id: number;
  species_name: string;
  description: string | null;
}

interface StageRow {
  id: number;
  species_id: number;
  stage_order: number;
  min_level: number;
  sprite_key: string;
}

interface PetRow {
  id: number;
  pet_name: string;
  level: number;
  xp: number;
  mood: PetMood;
  streak_days: number;
  last_fed_at: string | null;
  updated_at: string;
  species_id: number | null;
  current_stage_id: number | null;
  sprite_key: string | null;
  species_name: string | null;
}

function mapSpecies(row: SpeciesRow): PetSpecies {
  return {
    id: row.id,
    speciesName: row.species_name,
    description: row.description,
  };
}

function mapStage(row: StageRow): PetEvolutionStage {
  return {
    id: row.id,
    speciesId: row.species_id,
    stageOrder: row.stage_order,
    minLevel: row.min_level,
    spriteKey: row.sprite_key,
  };
}

function mapPet(row: PetRow): PetState {
  return {
    id: row.id,
    petName: row.pet_name,
    level: row.level,
    xp: row.xp,
    mood: row.mood,
    streakDays: row.streak_days,
    lastFedAt: row.last_fed_at,
    updatedAt: row.updated_at,
    speciesId: row.species_id,
    currentStageId: row.current_stage_id,
    spriteKey: row.sprite_key,
    speciesName: row.species_name,
  };
}

export async function listPetSpecies(): Promise<PetSpecies[]> {
  const rows = await select<SpeciesRow>(
    "SELECT id, species_name, description FROM pet_species ORDER BY id ASC",
  );
  return rows.map(mapSpecies);
}

export async function listStagesForSpecies(speciesId: number): Promise<PetEvolutionStage[]> {
  const rows = await select<StageRow>(
    `SELECT id, species_id, stage_order, min_level, sprite_key
     FROM pet_evolution_stages
     WHERE species_id = $1
     ORDER BY stage_order ASC`,
    [speciesId],
  );
  return rows.map(mapStage);
}

export async function getStageForLevel(
  speciesId: number,
  level: number,
): Promise<PetEvolutionStage | null> {
  const row = await selectOne<StageRow>(
    `SELECT id, species_id, stage_order, min_level, sprite_key
     FROM pet_evolution_stages
     WHERE species_id = $1 AND min_level <= $2
     ORDER BY min_level DESC, stage_order DESC
     LIMIT 1`,
    [speciesId, level],
  );
  return row ? mapStage(row) : null;
}

export async function getPetState(): Promise<PetState | null> {
  const row = await selectOne<PetRow>(
    `SELECT p.id, p.pet_name, p.level, p.xp, p.mood, p.streak_days, p.last_fed_at, p.updated_at,
            p.species_id, p.current_stage_id, s.sprite_key, sp.species_name
     FROM pet_state p
     LEFT JOIN pet_evolution_stages s ON s.id = p.current_stage_id
     LEFT JOIN pet_species sp ON sp.id = p.species_id
     ORDER BY p.id ASC
     LIMIT 1`,
  );
  return row ? mapPet(row) : null;
}

export async function insertPetState(input: {
  petName: string;
  speciesId: number;
  stageId: number;
  lastFedAt: string;
}): Promise<void> {
  await execute("DELETE FROM pet_state");
  await execute(
    `INSERT INTO pet_state
      (pet_name, level, xp, mood, streak_days, last_fed_at, species_id, current_stage_id, updated_at)
     VALUES ($1, 1, 0, 'happy', 0, $2, $3, $4, $2)`,
    [input.petName, input.lastFedAt, input.speciesId, input.stageId],
  );
}

export async function updatePetState(input: {
  id: number;
  petName?: string;
  level: number;
  xp: number;
  mood: PetMood;
  streakDays: number;
  lastFedAt: string | null;
  speciesId: number | null;
  currentStageId: number | null;
  updatedAt: string;
}): Promise<void> {
  await execute(
    `UPDATE pet_state
     SET pet_name = COALESCE($1, pet_name),
         level = $2,
         xp = $3,
         mood = $4,
         streak_days = $5,
         last_fed_at = $6,
         species_id = $7,
         current_stage_id = $8,
         updated_at = $9
     WHERE id = $10`,
    [
      input.petName ?? null,
      input.level,
      input.xp,
      input.mood,
      input.streakDays,
      input.lastFedAt,
      input.speciesId,
      input.currentStageId,
      input.updatedAt,
    ],
  );
}
