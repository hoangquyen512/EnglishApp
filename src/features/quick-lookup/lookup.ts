import { normalizeLookupWord } from "./normalize";
import type { DictionaryCacheEntry, DictionaryEnSense } from "./types";

export const NETWORK_LOOKUP_ERROR =
  "Không thể tra từ mới lúc này — cần kết nối mạng";

export const NOT_FOUND_LOOKUP_ERROR = "Không tìm thấy từ này trong từ điển";

export type LookupDeps = {
  getCached: (word: string) => Promise<DictionaryCacheEntry | null>;
  fetchEn: (word: string) => Promise<DictionaryEnSense>;
  translateVi: (text: string) => Promise<string>;
  saveCache: (entry: DictionaryCacheEntry) => Promise<DictionaryCacheEntry>;
};

export function isLongGloss(text: string): boolean {
  return text.trim().split(/\s+/).filter(Boolean).length > 6;
}

export function shortGloss(raw: string): string {
  const trimmed = raw.trim();
  const first = (trimmed.split(/\s*[;|]\s*/)[0] ?? trimmed).replace(/[.]+$/g, "").trim();
  return first || trimmed;
}

export function needsVietnameseRefresh(entry: DictionaryCacheEntry): boolean {
  const vi = entry.meaningVi.trim();
  const en = (entry.definitionEn ?? "").trim();
  if (!vi) {
    return true;
  }
  if (en && vi === en) {
    return true;
  }
  return isLongGloss(vi);
}

export async function lookupWord(raw: string, deps: LookupDeps): Promise<DictionaryCacheEntry> {
  const word = normalizeLookupWord(raw);
  if (!word) {
    throw new Error("Empty lookup word");
  }

  const cached = await deps.getCached(word);
  if (
    cached &&
    !needsVietnameseRefresh(cached) &&
    Boolean(cached.exampleEn?.trim())
  ) {
    return cached;
  }

  let en: DictionaryEnSense;
  const shouldFetchEn = !cached || !cached.exampleEn?.trim();
  if (!shouldFetchEn && cached) {
    en = {
      word: cached.word,
      phoneticIpa: cached.phoneticIpa,
      partOfSpeech: cached.partOfSpeech,
      definitionEn: cached.definitionEn,
      exampleEn: cached.exampleEn,
    };
  } else {
    try {
      en = await deps.fetchEn(word);
    } catch (err) {
      if (cached) {
        en = {
          word: cached.word,
          phoneticIpa: cached.phoneticIpa,
          partOfSpeech: cached.partOfSpeech,
          definitionEn: cached.definitionEn,
          exampleEn: cached.exampleEn,
        };
      } else if (err instanceof Error && /not found/i.test(err.message)) {
        throw new Error(NOT_FOUND_LOOKUP_ERROR);
      } else {
        throw new Error(NETWORK_LOOKUP_ERROR);
      }
    }
  }

  let meaningVi = cached && !needsVietnameseRefresh(cached) ? cached.meaningVi : "";
  let source = cached?.source ?? "dictionaryapi";
  if (!meaningVi) {
    try {
      const translated = shortGloss((await deps.translateVi(word)).trim());
      if (translated && translated !== en.definitionEn?.trim()) {
        meaningVi = translated;
        source = "dictionaryapi+translate";
      }
    } catch {
      // Fall through; UI still shows IPA / English example.
    }
    if (!meaningVi) {
      meaningVi = en.definitionEn?.trim() || word;
    }
  }

  const entry: DictionaryCacheEntry = {
    word,
    phoneticIpa: en.phoneticIpa,
    partOfSpeech: en.partOfSpeech,
    meaningVi,
    definitionEn: en.definitionEn,
    exampleEn: en.exampleEn,
    source,
    cachedAt: new Date().toISOString(),
  };
  return deps.saveCache(entry);
}
