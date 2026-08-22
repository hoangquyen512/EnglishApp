import { describe, expect, it } from "vitest";
import { submitLookupQuery } from "./submit";

describe("submitLookupQuery", () => {
  it("does not lookup while the box is empty or whitespace", () => {
    expect(submitLookupQuery("")).toEqual({ type: "clear" });
    expect(submitLookupQuery("   ")).toEqual({ type: "clear" });
  });

  it("looks up the trimmed query only on submit", () => {
    expect(submitLookupQuery("  look up  ")).toEqual({
      type: "lookup",
      query: "look up",
    });
  });
});
