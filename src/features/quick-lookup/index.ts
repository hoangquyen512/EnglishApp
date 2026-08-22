import { getDictionaryCache, upsertDictionaryCache } from "../../db/dictionary-cache";
import { fetchDictionaryEn, translateToVietnamese } from "./api";
import { lookupWord } from "./lookup";
import type { DictionaryCacheEntry } from "./types";

export async function quickLookup(raw: string): Promise<DictionaryCacheEntry> {
  return lookupWord(raw, {
    getCached: getDictionaryCache,
    fetchEn: fetchDictionaryEn,
    translateVi: translateToVietnamese,
    saveCache: upsertDictionaryCache,
  });
}

export { NETWORK_LOOKUP_ERROR, NOT_FOUND_LOOKUP_ERROR } from "./lookup";
export { exampleSentence } from "./example-sentence";
export { formatLookupPhonetic } from "./phonetic";
export { normalizeLookupWord } from "./normalize";
export { submitLookupQuery } from "./submit";
export {
  clearRecentQueries,
  pushRecentQuery,
  readRecentLookups,
  removeRecentQuery,
  writeRecentLookups,
} from "./recent-history";
export { translateToVietnamese } from "./api";
export type { DictionaryCacheEntry } from "./types";
