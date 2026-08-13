import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { TOEIC_ART_KEYS, TOEIC_CARDS } from "./toeic-cards";
import { readFileSync } from "node:fs";

describe("vocabulary illustrations", () => {
  it("has a picture file for every illustration key", () => {
    expect(TOEIC_ART_KEYS.length).toBeGreaterThan(0);
    for (const key of TOEIC_ART_KEYS) {
      expect(existsSync(resolve("public/arts", `${key}.jpg`)), key).toBe(true);
      expect(existsSync(resolve("docs/uiux-demo/arts", `${key}.jpg`)), key).toBe(true);
    }
    for (const card of TOEIC_CARDS) {
      expect(TOEIC_ART_KEYS).toContain(card.imageKey);
    }
  });

  it("waits for the picture before painting the word in the phone demo", () => {
    const html = readFileSync(resolve("docs/uiux-demo/study.html"), "utf8");
    expect(html).toContain("whenLoaded");
    expect(html).toContain("naturalWidth");
    expect(html).toContain("paint(c)");
    expect(html).toContain('fetch("vocabulary.json")');
    const paintAt = html.indexOf("function paint(c)");
    const showAt = html.indexOf("function show(");
    const whenLoadedInShow = html.indexOf("whenLoaded(img", showAt);
    expect(paintAt).toBeGreaterThan(0);
    expect(whenLoadedInShow).toBeGreaterThan(showAt);
    expect(html.indexOf("paint(c)", whenLoadedInShow)).toBeGreaterThan(whenLoadedInShow);
  });
});
