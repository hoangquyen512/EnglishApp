import type { ConversationTopicId } from "../../types";
import type { TopicCode } from "./catalog";

/** Legacy phrase seed codes → catalog codes. */
export const LEGACY_PHRASE_TOPIC_MAP: Record<string, TopicCode> = {
  travel: "travel",
  food: "food_dining",
  office: "office_work",
  family: "family",
};

/** Catalog topic → conversation JSON bank ids (Approach B). */
export const TOPIC_CONVERSATION_BANKS: Record<TopicCode, ConversationTopicId[]> = {
  family: ["family"],
  food_dining: ["cafe", "restaurant"],
  shopping: ["shopping"],
  health: ["health", "emergency"],
  weather: [],
  housing: [],
  transportation: ["directions"],
  office_work: ["work"],
  meetings_presentations: [],
  business_email: [],
  job_interview: [],
  education: [],
  travel: ["airport", "hotel"],
  hobbies_entertainment: [],
  sports: [],
  technology_social_media: ["phone"],
  small_talk_greetings: ["greetings"],
  banking_finance: [],
};

export function mapLegacyPhraseTopic(raw: string): TopicCode | null {
  return LEGACY_PHRASE_TOPIC_MAP[raw] ?? null;
}

export function conversationBanksForTopics(topicCodes: TopicCode[]): ConversationTopicId[] {
  const seen = new Set<ConversationTopicId>();
  const banks: ConversationTopicId[] = [];
  for (const code of topicCodes) {
    for (const bank of TOPIC_CONVERSATION_BANKS[code] ?? []) {
      if (!seen.has(bank)) {
        seen.add(bank);
        banks.push(bank);
      }
    }
  }
  return banks;
}
