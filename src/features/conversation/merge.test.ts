import { describe, expect, it } from "vitest";
import type { StudyFlashcard } from "../../types";
import {
  communicationCardsForLevel,
  mergeCommunicationDecks,
  type CommunicationSourceCard,
} from "./merge";

function card(
  override: Partial<StudyFlashcard> & Pick<StudyFlashcard, "contentId" | "contentType" | "word">,
): StudyFlashcard {
  return {
    phonetic: null,
    partOfSpeech: null,
    meaning: "nghĩa",
    example: null,
    exampleVi: null,
    imageKey: "/arts/fallback.jpg",
    topic: "family",
    ...override,
  };
}

function phrase(override: Partial<StudyFlashcard> = {}, level = "A1"): CommunicationSourceCard {
  return {
    card: card({
      contentId: 10,
      contentType: "phrase",
      word: "This is my older sister.",
      meaning: "Đây là chị gái tôi.",
      ...override,
    }),
    level,
  };
}

function conversation(override: Partial<StudyFlashcard> = {}): CommunicationSourceCard {
  return {
    card: card({
      contentId: 1,
      contentType: "conversation",
      word: "This is my older sister.",
      phonetic: "/ðɪs ɪz maɪ ˈəʊldər ˈsɪstər/",
      imageKey: "/illustrations/fam-1.jpg",
      example: "Gia đình và bạn bè",
      ...override,
    }),
  };
}

describe("mergeCommunicationDecks", () => {
  it("merges the same English in the same topic into one phrase card", () => {
    const merged = mergeCommunicationDecks([phrase()], [conversation()]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.card).toMatchObject({
      contentId: 10,
      contentType: "phrase",
      word: "This is my older sister.",
      meaning: "Đây là chị gái tôi.",
      phonetic: "/ðɪs ɪz maɪ ˈəʊldər ˈsɪstər/",
      imageKey: "/illustrations/fam-1.jpg",
      example: "Gia đình và bạn bè",
    });
    expect(merged[0]?.level).toBe("A1");
  });

  it("treats casing and extra spaces as the same sentence", () => {
    const merged = mergeCommunicationDecks(
      [phrase({ word: "this is my older sister." })],
      [conversation({ word: "  This is my older  sister.  " })],
    );
    expect(merged).toHaveLength(1);
  });

  it("keeps the same English in different topics as two cards", () => {
    const merged = mergeCommunicationDecks(
      [phrase({ topic: "family" })],
      [conversation({ topic: "travel" })],
    );
    expect(merged).toHaveLength(2);
  });

  it("keeps phrase-only and conversation-only cards", () => {
    const merged = mergeCommunicationDecks(
      [phrase({ word: "Can I bring a friend?", contentId: 11 })],
      [conversation({ word: "Where is the restroom?", contentId: 99 })],
    );
    expect(merged).toHaveLength(2);
    expect(merged.find((item) => item.card.word === "Can I bring a friend?")?.card.contentType).toBe(
      "phrase",
    );
    expect(
      merged.find((item) => item.card.word === "Where is the restroom?")?.card,
    ).toMatchObject({
      contentId: 99,
      contentType: "conversation",
    });
  });
});

describe("communicationCardsForLevel", () => {
  it("drops merged phrase cards above the preferred CEFR", () => {
    const merged = mergeCommunicationDecks(
      [phrase({ word: "Congratulations! I am so happy for you." }, "B2")],
      [conversation({ word: "Congratulations! I am so happy for you." })],
    );
    const allowed = communicationCardsForLevel(merged, "A1");
    expect(allowed).toEqual([]);
  });

  it("keeps conversation-only cards that have no CEFR", () => {
    const merged = mergeCommunicationDecks(
      [],
      [conversation({ word: "Where is the restroom?" })],
    );
    const allowed = communicationCardsForLevel(merged, "A1");
    expect(allowed).toHaveLength(1);
    expect(allowed[0]?.contentType).toBe("conversation");
  });
});
