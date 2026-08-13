import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentType, PhraseTopic, StudyMode } from "../types";
import { userSettingsStorage } from "../lib/user-storage";

interface StudyState extends StudyMode {
  setContentType: (contentType: ContentType) => void;
  setTopic: (topic: PhraseTopic | null) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      contentType: "vocabulary",
      topic: null,
      setContentType: (contentType) =>
        set({
          contentType,
          topic: contentType === "vocabulary" ? null : null,
        }),
      setTopic: (topic) => set({ topic }),
    }),
    {
      name: "vocab-pet-study",
      storage: createJSONStorage(() => userSettingsStorage),
    },
  ),
);
