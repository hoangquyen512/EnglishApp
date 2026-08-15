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
});
