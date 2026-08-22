import { describe, expect, it } from "vitest";
import { pickRandomStory, resolveReaderChapterId } from "./home-story-teaser";

describe("pickRandomStory", () => {
  it("returns null for an empty list", () => {
    expect(pickRandomStory([])).toBeNull();
  });

  it("returns the only story when length is 1", () => {
    expect(pickRandomStory([{ id: 7 }])).toEqual({ id: 7 });
  });
});

describe("resolveReaderChapterId", () => {
  it("prefers saved progress chapter when available", () => {
    expect(
      resolveReaderChapterId([{ id: 101 }, { id: 102 }], 102),
    ).toBe(102);
  });

  it("falls back to the first chapter", () => {
    expect(resolveReaderChapterId([{ id: 101 }, { id: 102 }], null)).toBe(101);
  });
});
