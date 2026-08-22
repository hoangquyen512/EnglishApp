import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentType, StudyMode } from "../types";
import { studyModeFromStored } from "../features/vocabulary/study-mode";
import { userSettingsStorage } from "../lib/user-storage";

interface StudyState extends StudyMode {
  setContentType: (contentType: ContentType) => void;
  hydratedFromPreference: boolean;
  markHydratedFromPreference: () => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      contentType: "vocabulary",
      hydratedFromPreference: false,
      setContentType: (contentType) => set({ contentType: studyModeFromStored(contentType) }),
      markHydratedFromPreference: () => set({ hydratedFromPreference: true }),
    }),
    {
      name: "yume-study",
      storage: createJSONStorage(() => userSettingsStorage),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<StudyState>;
        return {
          ...current,
          ...stored,
          contentType: studyModeFromStored(stored.contentType ?? current.contentType),
        };
      },
      partialize: (state) => ({
        contentType: state.contentType,
        hydratedFromPreference: state.hydratedFromPreference,
      }),
    },
  ),
);
