import { describe, expect, it } from "vitest";
import { splitFeaturedText } from "./story-reader-screen";

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
