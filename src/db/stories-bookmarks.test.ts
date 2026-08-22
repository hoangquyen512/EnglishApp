import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setCurrentUserId } from "./current-user";
import {
  STORIES_BROWSER_KEY,
  deleteStoryBookmark,
  hasStoryBookmark,
  insertStoryBookmark,
} from "./stories";

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  setCurrentUserId(42);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
});

afterEach(() => {
  setCurrentUserId(null);
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

describe("hasStoryBookmark", () => {
  it("reflects bookmark insertion and removal for the active user and chapter", async () => {
    const bookmark = { storyId: 5, chapterId: 12 };

    expect(await hasStoryBookmark(5, 12)).toBe(false);
    await insertStoryBookmark(bookmark);
    expect(await hasStoryBookmark(5, 12)).toBe(true);
    await deleteStoryBookmark(bookmark);
    expect(await hasStoryBookmark(5, 12)).toBe(false);
    expect(values.has(STORIES_BROWSER_KEY)).toBe(true);
  });
});
