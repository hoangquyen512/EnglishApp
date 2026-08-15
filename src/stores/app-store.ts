import { create } from "zustand";
import type { DailyMission, PetSpecies, PetState, UserProgress } from "../types";
import { DEMO_MISSIONS, DEMO_SPECIES } from "../data/demo-pet";
import {
  adoptSpecies,
  ensureDailyMissions,
  getCurrentPet,
  getProgress,
  listSpecies,
  refreshMood,
  refreshUserProgress,
  todaysMissions,
} from "../features/pet-state";
import { alignPetToSpecies, buildAdoptedDemoPet } from "../features/pet-state/demo-pet";
import { isTauri } from "../lib/tauri";
import { peekCurrentUserId } from "../db/current-user";
import { readBrowserJson, writeBrowserJson } from "../lib/browser-persist";
import { resolveUserDataDirs } from "../lib/user-paths";
import { ensureLearningProgram } from "../features/learning-program";
import { ensurePhase1LexiconImported } from "../db/lexicon-import";

function demoPetKey(userId: number): string {
  return `yume-demo-pet:${userId}`;
}

function loadDemoPet(userId: number): PetState | null {
  return readBrowserJson<PetState>(demoPetKey(userId));
}

function saveDemoPet(userId: number, pet: PetState): void {
  writeBrowserJson(demoPetKey(userId), pet);
}

interface AppState {
  ready: boolean;
  error: string | null;
  pet: PetState | null;
  species: PetSpecies[];
  missions: DailyMission[];
  progress: UserProgress | null;
  hydrate: () => Promise<void>;
  chooseSpecies: (species: PetSpecies, petName?: string) => Promise<void>;
  reloadMissions: () => Promise<void>;
  setPet: (pet: PetState) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  error: null,
  pet: null,
  species: [],
  missions: [],
  progress: null,
  hydrate: async () => {
    if (!isTauri()) {
      const userId = peekCurrentUserId();
      const loaded = userId ? loadDemoPet(userId) : null;
      const pet = loaded ? alignPetToSpecies(loaded, DEMO_SPECIES) : null;
      if (
        userId &&
        pet &&
        loaded &&
        (pet.spriteKey !== loaded.spriteKey ||
          pet.currentStageId !== loaded.currentStageId ||
          pet.speciesName !== loaded.speciesName)
      ) {
        saveDemoPet(userId, pet);
      }
      set({
        ready: true,
        error: null,
        species: DEMO_SPECIES,
        pet,
        missions: DEMO_MISSIONS,
        progress: null,
      });
      return;
    }
    try {
      await resolveUserDataDirs();
      const species = await listSpecies();
      await ensureLearningProgram();
      await ensureDailyMissions();
      await refreshUserProgress();
      const pet = await refreshMood();
      const missions = await todaysMissions();
      const progress = await getProgress();
      set({
        ready: true,
        error: null,
        species,
        pet: pet ?? (await getCurrentPet()),
        missions,
        progress,
      });
      // 8k row first-run import must not block the post-login UI.
      void ensurePhase1LexiconImported().catch((importError) => {
        console.error("phase1 lexicon import failed", importError);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load app";
      set({ ready: true, error: message });
    }
  },
  chooseSpecies: async (species, petName) => {
    if (!isTauri()) {
      const userId = peekCurrentUserId();
      const pet = buildAdoptedDemoPet(species, petName);
      if (userId) {
        saveDemoPet(userId, pet);
      }
      set({ pet });
      return;
    }
    const pet = await adoptSpecies(species, petName);
    set({ pet });
  },
  reloadMissions: async () => {
    const missions = await todaysMissions();
    const progress = await getProgress();
    const pet = await getCurrentPet();
    set({ missions, progress, pet });
  },
  setPet: (pet) => {
    set({ pet });
    void get().reloadMissions();
  },
  reset: () => {
    set({
      ready: false,
      error: null,
      pet: null,
      missions: [],
      progress: null,
      species: [],
    });
  },
}));
