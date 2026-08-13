import { create } from "zustand";

interface UiStore {
  flashcardOpen: boolean;
  openFlashcard: () => void;
  closeFlashcard: () => void;
}

/** UI state for web/mobile (in-app flashcard modal). */
export const useUiStore = create<UiStore>((set) => ({
  flashcardOpen: false,
  openFlashcard: () => set({ flashcardOpen: true }),
  closeFlashcard: () => set({ flashcardOpen: false }),
}));
