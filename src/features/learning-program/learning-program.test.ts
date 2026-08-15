import { describe, expect, it } from "vitest";
import { TOEIC_CARDS } from "../../data/toeic-cards";
import { DEFAULT_ACTIVE_TOPIC_CODES, TOPIC_CATALOG } from "./catalog";
import { conversationBanksForTopics, mapLegacyPhraseTopic } from "./mapping";
import { phraseLevelAllowed } from "./level";
import {
  canSaveTopicSelection,
  defaultContentTypeFromPreference,
  pickRandomTopicCode,
  shouldWarnLowContent,
  toggleTopicSelection,
} from "./validate";
import { assignVocabTopicCode, vocabWordsForTopic } from "./vocab-heuristic";

describe("topic catalog", () => {
  it("seeds eighteen topics across four categories", () => {
    expect(TOPIC_CATALOG).toHaveLength(18);
    expect(DEFAULT_ACTIVE_TOPIC_CODES).toEqual([
      "family",
      "food_dining",
      "office_work",
      "travel",
    ]);
  });
});

describe("legacy phrase mapping", () => {
  it("maps old free-text topics onto catalog codes", () => {
    expect(mapLegacyPhraseTopic("food")).toBe("food_dining");
    expect(mapLegacyPhraseTopic("office")).toBe("office_work");
    expect(mapLegacyPhraseTopic("travel")).toBe("travel");
    expect(mapLegacyPhraseTopic("family")).toBe("family");
  });
});

describe("conversation bank mapping", () => {
  it("unions banks for active catalog topics without duplicates", () => {
    expect(conversationBanksForTopics(["food_dining", "travel"])).toEqual([
      "cafe",
      "restaurant",
      "airport",
      "hotel",
    ]);
    expect(conversationBanksForTopics(["weather"])).toEqual([]);
  });
});

describe("vocab heuristic", () => {
  it("tags each default topic with at least one TOEIC lemma", () => {
    for (const code of DEFAULT_ACTIVE_TOPIC_CODES) {
      const words = vocabWordsForTopic(code);
      expect(words.length).toBeGreaterThan(0);
      const inBank = words.filter((word) =>
        TOEIC_CARDS.some((card) => card.word.toLowerCase() === word),
      );
      expect(inBank.length).toBeGreaterThan(0);
    }
  });

  it("leaves unmatched lemmas untagged", () => {
    expect(assignVocabTopicCode("zzzz-not-a-word")).toBeNull();
    expect(assignVocabTopicCode("flight")).toBe("travel");
  });
});

describe("program validation", () => {
  it("blocks clearing the last topic and warns below fifteen items", () => {
    expect(canSaveTopicSelection([])).toBe(false);
    expect(canSaveTopicSelection(["travel"])).toBe(true);
    expect(toggleTopicSelection(["travel"], "travel")).toEqual({
      next: ["travel"],
      blocked: true,
    });
    expect(shouldWarnLowContent(14)).toBe(true);
    expect(shouldWarnLowContent(15)).toBe(false);
  });

  it("picks missions topics only from the active set", () => {
    expect(pickRandomTopicCode(["family", "travel"], () => 0)).toBe("family");
    expect(pickRandomTopicCode([], () => 0)).toBeNull();
  });

  it("maps content preference onto an initial study mode", () => {
    expect(defaultContentTypeFromPreference("phrase")).toBe("phrase");
    expect(defaultContentTypeFromPreference("both")).toBe("vocabulary");
  });
});

describe("cefr preference", () => {
  it("keeps phrases at or below the preferred level", () => {
    expect(phraseLevelAllowed("A1", "A2")).toBe(true);
    expect(phraseLevelAllowed("B1", "A2")).toBe(false);
    expect(phraseLevelAllowed("B2", "B2")).toBe(true);
  });
});
