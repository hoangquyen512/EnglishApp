import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentType, StudyMode } from "../types";
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
      setContentType: (contentType) => set({ contentType }),
      markHydratedFromPreference: () => set({ hydratedFromPreference: true }),
    }),
    {
      name: "yume-study",
      storage: createJSONStorage(() => userSettingsStorage),
      partialize: (state) => ({
        contentType: state.contentType,
        hydratedFromPreference: state.hydratedFromPreference,
      }),
    },
  ),
);
