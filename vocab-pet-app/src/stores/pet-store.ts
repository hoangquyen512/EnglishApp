import { create } from "zustand";
import { loadPetSnapshot } from "../features/pet-state";
import type { PetSnapshot } from "../features/pet-state";

interface PetStore {
  snapshot: PetSnapshot | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePetStore = create<PetStore>((set) => ({
  snapshot: null,
  isLoading: false,
  error: null,

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await loadPetSnapshot();
      set({ snapshot, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : String(err),
        isLoading: false,
      });
    }
  },
}));
