import { describe, expect, it } from "vitest";
import { conversationTopics } from "../../data/conversation/topics";
import { conversationDeck } from "./index";

describe("conversation topics", () => {
  it("has twelve topics with 1000 unique phrases each", () => {
    expect(conversationTopics).toHaveLength(12);
    const ids = conversationTopics.flatMap((topic) => topic.phrases.map((phrase) => phrase.id));
    expect(ids).toHaveLength(12_000);
    expect(new Set(ids).size).toBe(12_000);
  });

  it("maps a greetings deck onto study flashcards", () => {
    const deck = conversationDeck("greetings");
    expect(deck[0]?.word).toBe("Hi, how are you today?");
    expect(deck[0]?.imageKey).toBe("/illustrations/greet-1.jpg");
    expect(deck[0]?.contentType).toBe("conversation");
  });
});
