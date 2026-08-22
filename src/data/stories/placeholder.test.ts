import { describe, expect, it } from "vitest";
import { chapterHasPlaceholderContent, isPlaceholderStoryText } from "./placeholder";

describe("isPlaceholderStoryText", () => {
  it("flags legacy MVP placeholder strings", () => {
    expect(isPlaceholderStoryText("Placeholder content for Milo, chapter 3.")).toBe(true);
    expect(isPlaceholderStoryText("Nội dung mẫu cho Milo, chương 3.")).toBe(true);
    expect(isPlaceholderStoryText("This chapter continues the story of Sora and Blu.")).toBe(
      true,
    );
  });

  it("allows real story prose", () => {
    expect(isPlaceholderStoryText("Sora smiled. \"Let's be friends.\"")).toBe(false);
  });
});

describe("chapterHasPlaceholderContent", () => {
  it("flags empty or placeholder chapters", () => {
    expect(chapterHasPlaceholderContent([])).toBe(true);
    expect(
      chapterHasPlaceholderContent([
        { enSentences: ["Placeholder content for A New Friend, chapter 2."] },
      ]),
    ).toBe(true);
  });

  it("accepts multi-unit chapters", () => {
    expect(
      chapterHasPlaceholderContent([
        { enSentences: ["On a quiet hill at the edge of the forest, lived a little fox named Sora."] },
        { enSentences: ["\"Hello!\" said Sora gently."] },
        { enSentences: ["They played together all day."] },
      ]),
    ).toBe(false);
  });
});
