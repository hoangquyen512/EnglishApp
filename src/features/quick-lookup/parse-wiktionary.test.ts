import { describe, expect, it } from "vitest";
import { parseWiktionaryDefinition } from "./parse-wiktionary";

describe("parseWiktionaryDefinition", () => {
  it("takes the first English sense and strips HTML", () => {
    const payload = {
      en: [
        {
          partOfSpeech: "Noun",
          definitions: [
            {
              definition: "A <i>planned</i> endeavor.",
              examples: ["The project shipped."],
            },
          ],
        },
      ],
    };
    expect(parseWiktionaryDefinition("project", payload)).toEqual({
      word: "project",
      phoneticIpa: null,
      partOfSpeech: "noun",
      definitionEn: "A planned endeavor.",
      exampleEn: "The project shipped.",
    });
  });

  it("extracts IPA when the definition HTML includes it", () => {
    const payload = {
      en: [
        {
          partOfSpeech: "Interjection",
          definitions: [
            {
              definition: 'A greeting. <span class="ipa">/həˈləʊ/</span>',
              examples: ["Hello there!"],
            },
          ],
        },
      ],
    };
    expect(parseWiktionaryDefinition("hello", payload).phoneticIpa).toBe("/həˈləʊ/");
  });

  it("throws when there is no English entry", () => {
    expect(() => parseWiktionaryDefinition("x", {})).toThrow(/not found/i);
  });
});
