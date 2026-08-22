import { beforeEach, describe, expect, it } from "vitest";
import { getStudyDeck } from "../vocabulary";
import { saveLearningProgram } from "./index";

describe("study deck follows learning program", () => {
  beforeEach(async () => {
    await saveLearningProgram({
      programName: "Test",
      levelPreference: "B2",
      contentTypePreference: "both",
      topicCodes: ["family", "food_dining", "office_work", "travel"],
    });
  });

  it("changes vocabulary and conversation content when topics change", async () => {
    const fullVocab = await getStudyDeck("vocabulary");
    const fullConversation = await getStudyDeck("conversation");
    expect(fullVocab.length).toBeGreaterThan(0);
    expect(fullConversation.length).toBeGreaterThan(0);

    await saveLearningProgram({
      programName: "Test",
      levelPreference: "B2",
      contentTypePreference: "both",
      topicCodes: ["travel"],
    });

    const travelVocab = await getStudyDeck("vocabulary");
    const travelConversation = await getStudyDeck("conversation");
    expect(travelVocab.every((card) => card.topic === "travel")).toBe(true);
    expect(travelConversation.every((card) => card.topic === "travel")).toBe(true);
    expect(travelVocab.length).toBeLessThan(fullVocab.length);
    expect(travelConversation.length).toBeLessThan(fullConversation.length);
  });

  it("gives phrase and conversation modes the same giao tiếp deck", async () => {
    const phraseDeck = await getStudyDeck("phrase");
    const conversationDeck = await getStudyDeck("conversation");
    const keys = (deck: typeof phraseDeck) =>
      [...deck.map((card) => `${card.topic}\0${card.word.toLowerCase()}`)].sort();
    expect(keys(conversationDeck)).toEqual(keys(phraseDeck));
  });

  it("fills duplicate giao tiếp cards with conversation IPA and art", async () => {
    const deck = await getStudyDeck("phrase");
    const card = deck.find((item) => item.word === "This is my older sister.");
    expect(card).toMatchObject({
      contentType: "phrase",
      phonetic: "/ðɪs ɪz maɪ ˈəʊldər ˈsɪstər/",
      imageKey: "/illustrations/fam-1.jpg",
      example: "Gia đình và bạn bè",
    });
  });

  it("hides conversation duplicates that exceed the CEFR preference", async () => {
    await saveLearningProgram({
      programName: "Test",
      levelPreference: "A1",
      contentTypePreference: "both",
      topicCodes: ["family"],
    });
    const deck = await getStudyDeck("phrase");
    expect(deck.some((card) => card.word === "Congratulations! I am so happy for you.")).toBe(false);
    expect(deck.some((card) => card.word === "This is my older sister.")).toBe(true);
  });
});
