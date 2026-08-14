import type { ConversationTopicId } from "../../types";

export const CONVERSATION_TOPIC_ORDER: ConversationTopicId[] = [
  "greetings",
  "cafe",
  "restaurant",
  "shopping",
  "directions",
  "hotel",
  "health",
  "work",
  "family",
  "phone",
  "airport",
  "emergency",
];

export function conversationContentId(phraseId: string): number {
  const dash = phraseId.lastIndexOf("-");
  const prefix = dash === -1 ? "greet" : phraseId.slice(0, dash);
  const n = Number(phraseId.slice(dash + 1));
  const topicIndex = CONVERSATION_TOPIC_ORDER.findIndex((id) => {
    const short = id === "greetings" ? "greet" : id === "restaurant" ? "rest" : id === "shopping" ? "shop" : id === "directions" ? "dir" : id === "emergency" ? "emg" : id === "family" ? "fam" : id === "airport" ? "air" : id;
    return short === prefix || id === prefix;
  });
  const safeTopic = topicIndex >= 0 ? topicIndex : 0;
  const safeN = Number.isFinite(n) && n > 0 ? n : 1;
  return safeTopic * 10_000 + safeN;
}
