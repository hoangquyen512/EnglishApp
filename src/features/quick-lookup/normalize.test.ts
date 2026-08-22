import { describe, expect, it } from "vitest";
import { normalizeLookupWord } from "./normalize";

describe("normalizeLookupWord", () => {
  it("trims and lowercases", () => {
    expect(normalizeLookupWord("  Hello  ")).toBe("hello");
  });

  it("collapses internal whitespace for phrases", () => {
    expect(normalizeLookupWord("  look   up  ")).toBe("look up");
  });

  it("returns empty string for blank input", () => {
    expect(normalizeLookupWord("   ")).toBe("");
    expect(normalizeLookupWord("")).toBe("");
  });
});
