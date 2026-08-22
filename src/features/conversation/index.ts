import type { StudyFlashcard } from "../../types";
import { conversationTopics } from "../../data/conversation/topics";
import { conversationContentId } from "./ids";
import { illustrationSrcForPhrase } from "./illustration";
import type { ConversationTopicId } from "./types";

export type { ConversationPhrase, ConversationTopic, ConversationTopicId } from "./types";
export { conversationContentId } from "./ids";
export { illustrationSrc } from "./illustration";
export {
  communicationCardsForLevel,
  mergeCommunicationDecks,
} from "./merge";
export type { CommunicationSourceCard } from "./merge";
export { conversationTopics, getConversationTopic, isConversationTopicId } from "../../data/conversation/topics";

function cardsForBank(topicId: ConversationTopicId, topicCode: string | null): StudyFlashcard[] {
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
    imageKey: illustrationSrcForPhrase(phrase.id, phrase.en),
    topic: topicCode,
  }));
}

export function conversationDeck(topicId: ConversationTopicId): StudyFlashcard[] {
  return cardsForBank(topicId, null);
}

export function conversationDeckForBanks(
  banks: Array<{ bankId: ConversationTopicId; topicCode: string | null }>,
): StudyFlashcard[] {
  return banks.flatMap(({ bankId, topicCode }) => cardsForBank(bankId, topicCode));
}
