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

    const seedSql = readFileSync(
      resolve("src-tauri/migrations/024_seed_toeic_lexicon.sql"),
      "utf8",
    );
    expect(seedSql.startsWith("INSERT OR IGNORE INTO vocabulary")).toBe(true);
    expect(seedSql.trim().endsWith(";")).toBe(true);
    expect((seedSql.match(/\n  \(/g) ?? []).length).toBe(TOEIC_CARDS.length);

    for (const word of ["invoice", "barcode", "negotiate", "complimentary"]) {
      expect(seedSql).toContain(`'${word}'`);
      expect(TOEIC_CARDS.some((card) => card.word === word)).toBe(true);
    }
  });
});
