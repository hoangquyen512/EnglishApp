import { create } from "zustand";
import type { DailyMission, PetSpecies, PetState, UserProgress } from "../types";
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
import { resolveUserDataDirs } from "../lib/user-paths";

interface AppState {
  ready: boolean;
  error: string | null;
  pet: PetState | null;
  species: PetSpecies[];
  missions: DailyMission[];
  progress: UserProgress | null;
  hydrate: () => Promise<void>;
  chooseSpecies: (species: PetSpecies) => Promise<void>;
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
  chooseSpecies: async (species) => {
    const pet = await adoptSpecies(species);
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
    });
  },
}));
