import { describe, expect, it } from "vitest";
import {
  clearRecentQueries,
  pushRecentQuery,
  readRecentLookups,
  removeRecentQuery,
  writeRecentLookups,
} from "./recent-history";

describe("pushRecentQuery", () => {
  it("prepends a new query and drops duplicates (case-insensitive)", () => {
    expect(pushRecentQuery(["loyal", "treat"], "Loyal")).toEqual(["loyal", "treat"]);
    expect(pushRecentQuery(["treat"], "loyal")).toEqual(["loyal", "treat"]);
  });

  it("ignores blank queries and caps the list", () => {
    expect(pushRecentQuery(["loyal"], "   ")).toEqual(["loyal"]);
    const many = Array.from({ length: 20 }, (_, i) => `w${i}`);
    expect(pushRecentQuery(many, "fresh")).toEqual([
      "fresh",
      ...many.slice(0, 11),
    ]);
  });
});

describe("removeRecentQuery / clearRecentQueries", () => {
  it("removes one query and clears all", () => {
    expect(removeRecentQuery(["loyal", "treat"], "loyal")).toEqual(["treat"]);
    expect(clearRecentQueries()).toEqual([]);
  });
});

describe("readRecentLookups / writeRecentLookups", () => {
  it("round-trips through storage and rejects corrupt payloads", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };

    writeRecentLookups(["loyal", "treat"], storage);
    expect(readRecentLookups(storage)).toEqual(["loyal", "treat"]);

    store.set("yume.quick-lookup.recent", "{not-json");
    expect(readRecentLookups(storage)).toEqual([]);

    store.set("yume.quick-lookup.recent", JSON.stringify([1, "", "  ok  "]));
    expect(readRecentLookups(storage)).toEqual(["ok"]);
  });
});
