import { describe, expect, it } from "vitest";
import { partOfSpeechLabel } from "./part-of-speech";

describe("partOfSpeechLabel", () => {
  it("maps common TOEIC abbreviations to Vietnamese", () => {
    expect(partOfSpeechLabel("n.")).toBe("Danh từ");
    expect(partOfSpeechLabel("N.")).toBe("Danh từ");
    expect(partOfSpeechLabel("v.")).toBe("Động từ");
    expect(partOfSpeechLabel("adj.")).toBe("Tính từ");
    expect(partOfSpeechLabel("adv.")).toBe("Trạng từ");
  });

  it("returns null for empty values", () => {
    expect(partOfSpeechLabel(null)).toBeNull();
    expect(partOfSpeechLabel("")).toBeNull();
  });

  it("passes through unknown tags", () => {
    expect(partOfSpeechLabel("prep.")).toBe("prep.");
  });
});
