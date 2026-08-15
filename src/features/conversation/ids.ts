import type { TopicCode } from "../../types";
import { TOPIC_CATALOG } from "../learning-program/catalog";

export const CONVERSATION_TOPIC_ORDER: TopicCode[] = TOPIC_CATALOG.map((topic) => topic.code);

/** Map catalog / legacy phrase-id prefixes onto existing illustration folders. */
const ART_PREFIX: Record<string, string> = {
  family: "fam",
  food_dining: "cafe",
  office_work: "work",
  travel: "air",
  shopping: "shop",
  health: "health",
  transportation: "dir",
  small_talk_greetings: "greet",
  technology_social_media: "phone",
  greetings: "greet",
  cafe: "cafe",
  restaurant: "rest",
  directions: "dir",
  hotel: "hotel",
  work: "work",
  phone: "phone",
  airport: "air",
  emergency: "emg",
  fam: "fam",
  rest: "rest",
  shop: "shop",
  dir: "dir",
  emg: "emg",
  air: "air",
  greet: "greet",
};

export function conversationContentId(phraseId: string): number {
  const dash = phraseId.lastIndexOf("-");
  const prefix = dash === -1 ? "family" : phraseId.slice(0, dash);
  const n = Number(phraseId.slice(dash + 1));
  const topicIndex = CONVERSATION_TOPIC_ORDER.findIndex((id) => id === prefix);
  const safeTopic = topicIndex >= 0 ? topicIndex : 0;
  const safeN = Number.isFinite(n) && n > 0 ? n : 1;
  return safeTopic * 10_000 + safeN;
}

export { ART_PREFIX };
