import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { TOEIC_CARDS } from "./toeic-cards";

describe("TOEIC lexicon storage", () => {
  it("keeps the app JSON, phone demo JSON, and SQLite seed in sync", () => {
    const app = readFileSync(resolve("src/data/toeic-vocabulary.json"), "utf8");
    const demo = readFileSync(resolve("docs/uiux-demo/vocabulary.json"), "utf8");
    expect(demo).toBe(app);

    const html = readFileSync(resolve("docs/uiux-demo/study.html"), "utf8");
    expect(html).toContain('fetch("vocabulary.json")');

    const uniqueSql = readFileSync(
      resolve("src-tauri/migrations/023_vocab_word_unique.sql"),
      "utf8",
    );
    expect(uniqueSql).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_word");

    const seed024 = readFileSync(
      resolve("src-tauri/migrations/024_seed_toeic_lexicon.sql"),
      "utf8",
    );
    expect(seed024.startsWith("INSERT OR IGNORE INTO vocabulary")).toBe(true);
    expect((seed024.match(/\n  \(/g) ?? []).length).toBe(433);

    const seed025 = readFileSync(
      resolve("src-tauri/migrations/025_seed_toeic_lexicon_1000.sql"),
      "utf8",
    );
    expect(seed025.startsWith("INSERT OR IGNORE INTO vocabulary")).toBe(true);
    expect(seed025.trim().endsWith(";")).toBe(true);
    expect((seed025.match(/\n  \(/g) ?? []).length).toBe(TOEIC_CARDS.length - 433);
    expect(TOEIC_CARDS.length).toBe(1000);

    for (const word of ["invoice", "barcode", "negotiate", "complimentary", "waitlist", "minibar"]) {
      expect(TOEIC_CARDS.some((card) => card.word === word)).toBe(true);
    }
  });
});
