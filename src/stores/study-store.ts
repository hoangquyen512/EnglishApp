import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentType, ConversationTopicId, PhraseTopic, StudyMode } from "../types";
import { userSettingsStorage } from "../lib/user-storage";

interface StudyState extends StudyMode {
  setContentType: (contentType: ContentType) => void;
  setTopic: (topic: PhraseTopic | null) => void;
  setConversationTopic: (topic: ConversationTopicId) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      contentType: "vocabulary",
      topic: null,
      conversationTopic: "greetings",
      setContentType: (contentType) =>
        set({
          contentType,
        }),
      setTopic: (topic) => set({ topic }),
      setConversationTopic: (conversationTopic) => set({ conversationTopic }),
    }),
    {
      name: "yume-study",
      storage: createJSONStorage(() => userSettingsStorage),
    },
  ),
);
