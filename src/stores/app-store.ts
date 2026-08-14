import { create } from "zustand";
import type { DailyMission, PetSpecies, PetState, UserProgress } from "../types";
import { DEMO_MISSIONS, DEMO_PET, DEMO_SPECIES } from "../data/demo-pet";
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
import { isTauri } from "../lib/tauri";
import { resolveUserDataDirs } from "../lib/user-paths";

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
      set({
        ready: true,
        error: null,
        species: DEMO_SPECIES,
        pet: DEMO_PET,
        missions: DEMO_MISSIONS,
        progress: null,
      });
      return;
    }
    try {
      await resolveUserDataDirs();
      const species = await listSpecies();
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load app";
      set({ ready: true, error: message });
    }
  },
  chooseSpecies: async (species, petName) => {
    if (!isTauri()) {
      set({
        pet: {
          ...DEMO_PET,
          petName: petName?.trim() || species.speciesName,
          speciesName: species.speciesName,
          speciesId: species.id,
        },
      });
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
}));
