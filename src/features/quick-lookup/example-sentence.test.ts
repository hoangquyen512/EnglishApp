import { describe, expect, it } from "vitest";
import { exampleSentence } from "./example-sentence";

describe("exampleSentence", () => {
  it("keeps an API example that already contains the word", () => {
    expect(exampleSentence("project", "The project shipped on time.")).toBe(
      "The project shipped on time.",
    );
  });

  it("builds a short English sentence when the API has no example", () => {
    expect(exampleSentence("project", null).toLowerCase()).toContain("project");
  });
});
