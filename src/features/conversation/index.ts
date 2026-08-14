import { conversationTopics } from "../../data/conversation/topics";
import type { StudyFlashcard } from "../../types";
import { conversationContentId } from "./ids";
import { illustrationSrc } from "./illustration";
import type { ConversationTopicId } from "./types";

export type { ConversationPhrase, ConversationTopic, ConversationTopicId } from "./types";
export { conversationContentId } from "./ids";
export { illustrationSrc } from "./illustration";
export { conversationTopics, getConversationTopic, isConversationTopicId } from "../../data/conversation/topics";

export function conversationDeck(topicId: ConversationTopicId): StudyFlashcard[] {
  const topic = conversationTopics.find((item) => item.id === topicId);
  if (!topic) {
    return [];
  }
  return topic.phrases.map((phrase) => ({
    contentId: conversationContentId(phrase.id),
    contentType: "conversation" as const,
    word: phrase.en,
    phonetic: phrase.ipa || null,
    partOfSpeech: null,
    meaning: phrase.vi,
    example: phrase.note || null,
    exampleVi: null,
    imageKey: illustrationSrc(phrase.id),
    topic: null,
  }));
}
