import { describe, expect, it } from "vitest";
import { conversationTopics } from "../../data/conversation/topics";
import { PHASE1_PHRASES, PHASE1_TOPIC_CODES, PHASE1_VOCABULARY } from "../../data/lexicon/phase1";
import { conversationDeck, conversationDeckForBanks } from "./index";
import { illustrationSrc } from "./illustration";

describe("phase1 conversation banks", () => {
  it("exposes eighteen catalog topics and 1000 phrases on phase1 codes", () => {
    expect(conversationTopics).toHaveLength(18);
    for (const code of PHASE1_TOPIC_CODES) {
      const topic = conversationTopics.find((item) => item.id === code);
      expect(topic?.phrases).toHaveLength(1000);
    }
  });

  it("maps a family deck onto study flashcards with art prefix", () => {
    const deck = conversationDeck("family");
    expect(deck[0]?.contentType).toBe("conversation");
    expect(deck[0]?.imageKey).toBe("/illustrations/fam-1.jpg");
    expect(illustrationSrc("food_dining-1")).toBe("/illustrations/cafe-1.jpg");
  });

  it("builds a multi-bank deck from active program topics", () => {
    const deck = conversationDeckForBanks([
      { bankId: "family", topicCode: "family" },
      { bankId: "travel", topicCode: "travel" },
    ]);
    expect(deck.length).toBe(2000);
  });
});

describe("phase1 lexicon files", () => {
  it("has 1000 vocab and phrases per phase1 topic with unique words", () => {
    const words: string[] = [];
    for (const code of PHASE1_TOPIC_CODES) {
      expect(PHASE1_VOCABULARY[code]).toHaveLength(1000);
      expect(PHASE1_PHRASES[code]).toHaveLength(1000);
      words.push(...PHASE1_VOCABULARY[code]!.map((row) => row.word));
    }
    expect(new Set(words).size).toBe(words.length);
  });
});
