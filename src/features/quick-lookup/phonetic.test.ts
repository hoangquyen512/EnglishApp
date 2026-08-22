import { describe, expect, it } from "vitest";
import { formatLookupPhonetic, extractIpa } from "./phonetic";

describe("formatLookupPhonetic", () => {
  it("returns null when IPA is missing", () => {
    expect(formatLookupPhonetic(null)).toBeNull();
    expect(formatLookupPhonetic("   ")).toBeNull();
  });

  it("keeps slash-wrapped IPA", () => {
    expect(formatLookupPhonetic("/həˈloʊ/")).toBe("/həˈloʊ/");
  });

  it("wraps bare IPA in slashes", () => {
    expect(formatLookupPhonetic("həˈloʊ")).toBe("/həˈloʊ/");
  });

  it("extracts the first slash-wrapped IPA from surrounding text", () => {
    expect(extractIpa("A greeting. /həˈləʊ/")).toBe("/həˈləʊ/");
  });
});
