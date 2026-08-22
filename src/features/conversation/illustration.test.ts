import { describe, expect, it } from "vitest";
import {
  illustrationSrc,
  illustrationSrcForPhrase,
  normalizeCommunicationSentence,
  resolveCommunicationArt,
} from "./illustration";

describe("illustrationSrc", () => {
  it("reuses the eight topic pictures in a cycle", () => {
    expect(illustrationSrc("greet-1")).toBe("/illustrations/greet-1.jpg");
    expect(illustrationSrc("greet-8")).toBe("/illustrations/greet-8.jpg");
    expect(illustrationSrc("greet-9")).toBe("/illustrations/greet-1.jpg");
    expect(illustrationSrc("cafe-16")).toBe("/illustrations/cafe-8.jpg");
  });
});

describe("normalizeCommunicationSentence", () => {
  it("strips time openers before lookup", () => {
    expect(normalizeCommunicationSentence("Now, I need a bottle of water, please.")).toBe(
      "i need a bottle of water, please",
    );
  });
});

describe("illustrationSrcForPhrase", () => {
  it("routes drink phrases to cafe art even inside travel banks", () => {
    expect(
      illustrationSrcForPhrase("travel-956", "Now, I need a bottle of water, please."),
    ).toBe("/illustrations/cafe-4.jpg");
  });

  it("keeps airport phrases on air art", () => {
    expect(illustrationSrcForPhrase("travel-12", "Where is the boarding gate?")).toMatch(
      /^\/illustrations\/air-[1-8]\.jpg$/,
    );
  });
});

describe("resolveCommunicationArt", () => {
  it("matches canonical conversation sentences", () => {
    expect(
      resolveCommunicationArt({
        sentence: "I would like a small iced latte.",
        topic: "food_dining",
      }),
    ).toBe("/illustrations/cafe-1.jpg");
  });

  it("normalizes time openers before matching phrase art", () => {
    expect(
      resolveCommunicationArt({
        sentence: "Now, I need a bottle of water, please.",
        topic: "travel",
        phraseId: "travel-956",
      }),
    ).toBe("/illustrations/cafe-2.jpg");
  });
});
