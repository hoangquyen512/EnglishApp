import { describe, expect, it } from "vitest";
import { parseDictionaryEntry } from "./parse-dictionary";

const SAMPLE = [
  {
    word: "hello",
    phonetic: "/həˈloʊ/",
    phonetics: [{ text: "/həˈloʊ/", audio: "" }],
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "A greeting.",
            example: "Hello, how are you?",
          },
        ],
      },
      {
        partOfSpeech: "verb",
        definitions: [{ definition: "To greet." }],
      },
    ],
  },
];

describe("parseDictionaryEntry", () => {
  it("takes the first sense for IPA, POS, definition, and example", () => {
    expect(parseDictionaryEntry(SAMPLE)).toEqual({
      word: "hello",
      phoneticIpa: "/həˈloʊ/",
      partOfSpeech: "noun",
      definitionEn: "A greeting.",
      exampleEn: "Hello, how are you?",
    });
  });

  it("falls back to phonetics[].text when top-level phonetic is missing", () => {
    const payload = [
      {
        word: "cat",
        phonetics: [{ text: "/kæt/" }],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [{ definition: "A small animal." }],
          },
        ],
      },
    ];
    expect(parseDictionaryEntry(payload).phoneticIpa).toBe("/kæt/");
  });

  it("returns nulls for missing optional fields without throwing", () => {
    const payload = [{ word: "x", meanings: [] }];
    expect(parseDictionaryEntry(payload)).toEqual({
      word: "x",
      phoneticIpa: null,
      partOfSpeech: null,
      definitionEn: null,
      exampleEn: null,
    });
  });

  it("throws a clear error when the payload is empty", () => {
    expect(() => parseDictionaryEntry([])).toThrow(/not found/i);
  });

  it("picks an example from a later sense when the first definition has none", () => {
    const payload = [
      {
        word: "project",
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [{ definition: "A planned endeavor." }],
          },
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "To throw forward.",
                example: "They project the image onto the wall.",
              },
            ],
          },
        ],
      },
    ];
    expect(parseDictionaryEntry(payload).exampleEn).toBe("They project the image onto the wall.");
    expect(parseDictionaryEntry(payload).partOfSpeech).toBe("noun");
  });
});
