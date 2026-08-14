import type { ConversationTopicId } from "../../types";

export interface ConversationPhrase {
  id: string;
  en: string;
  vi: string;
  ipa: string;
  note: string;
}

export interface ConversationTopic {
  id: ConversationTopicId;
  titleVi: string;
  titleEn: string;
  blurb: string;
  emoji: string;
  accent: string;
  phrases: ConversationPhrase[];
}

export type { ConversationTopicId };
