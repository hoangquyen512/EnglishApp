import type { ConversationPhrase, ConversationTopic } from "../../features/conversation/types";
import type { TopicCode } from "../../features/learning-program/catalog";
import { TOPIC_CATALOG } from "../../features/learning-program/catalog";
import family from "./banks/family.json";
import foodDining from "./banks/food_dining.json";
import officeWork from "./banks/office_work.json";
import travel from "./banks/travel.json";

const banks: Partial<Record<TopicCode, ConversationPhrase[]>> = {
  family: family as ConversationPhrase[],
  food_dining: foodDining as ConversationPhrase[],
  office_work: officeWork as ConversationPhrase[],
  travel: travel as ConversationPhrase[],
};

const accents: Partial<Record<TopicCode, string>> = {
  family: "#7a4b8a",
  food_dining: "#9a3f16",
  office_work: "#3f4f6a",
  travel: "#1f4e79",
};

export const conversationTopics: ConversationTopic[] = TOPIC_CATALOG.map((topic) => ({
  id: topic.code,
  titleVi: topic.nameVi,
  titleEn: topic.nameEn,
  blurb: topic.nameEn,
  emoji: "",
  accent: accents[topic.code] ?? "#c45c26",
  phrases: banks[topic.code] ?? [],
}));

export const conversationTopicById = new Map(
  conversationTopics.map((topic) => [topic.id, topic]),
);

export function isConversationTopicId(value: string): value is TopicCode {
  return conversationTopicById.has(value as TopicCode);
}

export function getConversationTopic(id: string): ConversationTopic | undefined {
  return conversationTopicById.get(id as TopicCode);
}
