import type { StudyFlashcard } from "../../types";
import type { CefrLevelPreference } from "../learning-program/catalog";
import { phraseLevelAllowed } from "../learning-program/level";

export interface CommunicationSourceCard {
  card: StudyFlashcard;
  level?: string | null;
}

function communicationKey(word: string, topic: string | null): string {
  const sentence = word.trim().toLowerCase().replace(/\s+/g, " ");
  const topicKey = (topic ?? "").trim().toLowerCase();
  return `${topicKey}\0${sentence}`;
}

function pickRicherText(preferred: string | null | undefined, fallback: string | null): string | null {
  const value = preferred?.trim();
  return value ? value : fallback;
}

function mergeCards(
  phrase: CommunicationSourceCard,
  conversation: CommunicationSourceCard,
): CommunicationSourceCard {
  const fromPhrase = phrase.card;
  const fromConversation = conversation.card;
  return {
    card: {
      ...fromPhrase,
      phonetic: pickRicherText(fromConversation.phonetic, fromPhrase.phonetic),
      imageKey: pickRicherText(fromConversation.imageKey, fromPhrase.imageKey) ?? fromPhrase.imageKey,
      example: pickRicherText(fromConversation.example, fromPhrase.example),
      exampleVi: pickRicherText(fromConversation.exampleVi, fromPhrase.exampleVi),
      meaning: fromPhrase.meaning.trim() ? fromPhrase.meaning : fromConversation.meaning,
    },
    level: phrase.level ?? conversation.level ?? null,
  };
}

export function mergeCommunicationDecks(
  phrases: CommunicationSourceCard[],
  conversations: CommunicationSourceCard[],
): CommunicationSourceCard[] {
  const byKey = new Map<string, CommunicationSourceCard>();
  for (const item of phrases) {
    byKey.set(communicationKey(item.card.word, item.card.topic), item);
  }
  const leftover: CommunicationSourceCard[] = [];
  for (const item of conversations) {
    const key = communicationKey(item.card.word, item.card.topic);
    const existing = byKey.get(key);
    if (existing) {
      byKey.set(key, mergeCards(existing, item));
    } else {
      leftover.push(item);
    }
  }
  return [...byKey.values(), ...leftover];
}

export function communicationCardsForLevel(
  items: CommunicationSourceCard[],
  preference: CefrLevelPreference,
): StudyFlashcard[] {
  return items
    .filter((item) => {
      if (!item.level) {
        return true;
      }
      return phraseLevelAllowed(item.level, preference);
    })
    .map((item) => item.card);
}
