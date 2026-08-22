import { describe, expect, it } from "vitest";
import { splitEnglishWords, splitFeaturedText } from "./story-reader-screen";
import { buildStoryVocabularyInput } from "./word-popover";

describe("splitFeaturedText", () => {
  it("marks featured lemmas without matching partial words", () => {
    expect(splitFeaturedText("The quiet forest is quietest.", ["quiet", "forest"])).toEqual([
      { text: "The ", featured: false },
      { text: "quiet", featured: true },
      { text: " ", featured: false },
      { text: "forest", featured: true },
      { text: " is quietest.", featured: false },
    ]);
  });

  it("matches featured lemmas case-insensitively and keeps punctuation", () => {
    expect(splitFeaturedText("Fly, little bird!", ["fly"])).toEqual([
      { text: "Fly", featured: true },
      { text: ", little bird!", featured: false },
    ]);
  });
});

describe("splitEnglishWords", () => {
  it("keeps punctuation while exposing English words as clickable parts", () => {
    expect(splitEnglishWords("Fly, little bird!")).toEqual([
      { text: "Fly", word: "Fly" },
      { text: ", ", word: null },
      { text: "little", word: "little" },
      { text: " ", word: null },
      { text: "bird", word: "bird" },
      { text: "!", word: null },
    ]);
  });

  it("keeps apostrophes inside a lookup word", () => {
    expect(splitEnglishWords("Don't stop.")).toEqual([
      { text: "Don't", word: "Don't" },
      { text: " ", word: null },
      { text: "stop", word: "stop" },
      { text: ".", word: null },
    ]);
  });
});

describe("buildStoryVocabularyInput", () => {
  it("preserves the selected sentence and translation when saving", () => {
    expect(
      buildStoryVocabularyInput(
        {
          word: "quiet",
          phoneticIpa: "/ˈkwaɪət/",
          partOfSpeech: "adjective",
          meaningVi: "yên tĩnh",
          definitionEn: "making little noise",
          exampleEn: null,
          source: "dictionary",
          cachedAt: "2026-08-22T00:00:00.000Z",
        },
        {
          storyId: 7,
          chapterId: 11,
          sentenceId: 19,
          sentenceEn: "The forest was quiet.",
          sentenceVi: "Khu rừng thật yên tĩnh.",
        },
      ),
    ).toEqual({
      word: "quiet",
      lemma: "quiet",
      ipa: "/ˈkwaɪət/",
      meaningVi: "yên tĩnh",
      storyId: 7,
      chapterId: 11,
      sentenceId: 19,
      originalSentence: "The forest was quiet.",
      contextTranslation: "Khu rừng thật yên tĩnh.",
    });
  });
});
