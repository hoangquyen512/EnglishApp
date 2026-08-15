import type { TopicCode } from "./catalog";

/** Catalog topic → conversation bank ids (1:1 with topics.code). */
export const TOPIC_CONVERSATION_BANKS: Record<TopicCode, TopicCode[]> = {
  family: ["family"],
  food_dining: ["food_dining"],
  shopping: ["shopping"],
  health: ["health"],
  weather: ["weather"],
  housing: ["housing"],
  transportation: ["transportation"],
  office_work: ["office_work"],
  meetings_presentations: ["meetings_presentations"],
  business_email: ["business_email"],
  job_interview: ["job_interview"],
  education: ["education"],
  travel: ["travel"],
  hobbies_entertainment: ["hobbies_entertainment"],
  sports: ["sports"],
  technology_social_media: ["technology_social_media"],
  small_talk_greetings: ["small_talk_greetings"],
  banking_finance: ["banking_finance"],
};

/** Legacy phrase seed codes → catalog codes. */
export const LEGACY_PHRASE_TOPIC_MAP: Record<string, TopicCode> = {
  travel: "travel",
  food: "food_dining",
  office: "office_work",
  family: "family",
};

export function mapLegacyPhraseTopic(raw: string): TopicCode | null {
  return LEGACY_PHRASE_TOPIC_MAP[raw] ?? null;
}

export function conversationBanksForTopics(topicCodes: TopicCode[]): TopicCode[] {
  const seen = new Set<TopicCode>();
  const banks: TopicCode[] = [];
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
