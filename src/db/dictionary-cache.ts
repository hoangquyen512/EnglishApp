import { execute, selectOne } from "./client";
import { isTauri } from "../lib/tauri";
import { readBrowserJson, writeBrowserJson } from "../lib/browser-persist";
import type { DictionaryCacheEntry } from "../features/quick-lookup/types";

interface DictionaryCacheRow {
  word: string;
  phonetic_ipa: string | null;
  part_of_speech: string | null;
  meaning_vi: string;
  definition_en: string | null;
  example_en: string | null;
  source: string;
  cached_at: string;
}

const BROWSER_KEY = "yume-dictionary-cache";

function mapRow(row: DictionaryCacheRow): DictionaryCacheEntry {
  return {
    word: row.word,
    phoneticIpa: row.phonetic_ipa,
    partOfSpeech: row.part_of_speech,
    meaningVi: row.meaning_vi,
    definitionEn: row.definition_en,
    exampleEn: row.example_en,
    source: row.source,
    cachedAt: row.cached_at,
  };
}

function readBrowserCache(): Record<string, DictionaryCacheEntry> {
  return readBrowserJson<Record<string, DictionaryCacheEntry>>(BROWSER_KEY) ?? {};
}

export async function getDictionaryCache(word: string): Promise<DictionaryCacheEntry | null> {
  if (!isTauri()) {
    return readBrowserCache()[word] ?? null;
  }
  const row = await selectOne<DictionaryCacheRow>(
    `SELECT word, phonetic_ipa, part_of_speech, meaning_vi, definition_en, example_en, source, cached_at
     FROM dictionary_cache WHERE word = $1`,
    [word],
  );
  return row ? mapRow(row) : null;
}

export async function upsertDictionaryCache(
  entry: DictionaryCacheEntry,
): Promise<DictionaryCacheEntry> {
  if (!isTauri()) {
    const all = readBrowserCache();
    all[entry.word] = entry;
    writeBrowserJson(BROWSER_KEY, all);
    return entry;
  }
  await execute(
    `INSERT INTO dictionary_cache
      (word, phonetic_ipa, part_of_speech, meaning_vi, definition_en, example_en, source, cached_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT(word) DO UPDATE SET
       phonetic_ipa = excluded.phonetic_ipa,
       part_of_speech = excluded.part_of_speech,
       meaning_vi = excluded.meaning_vi,
       definition_en = excluded.definition_en,
       example_en = excluded.example_en,
       source = excluded.source,
       cached_at = excluded.cached_at`,
    [
      entry.word,
      entry.phoneticIpa,
      entry.partOfSpeech,
      entry.meaningVi,
      entry.definitionEn,
      entry.exampleEn,
      entry.source,
      entry.cachedAt,
    ],
  );
  return entry;
}
