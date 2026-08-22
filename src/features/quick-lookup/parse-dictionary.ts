import type { DictionaryEnSense } from "./types";

type ApiDefinition = {
  definition?: string;
  example?: string;
};

type ApiMeaning = {
  partOfSpeech?: string;
  definitions?: ApiDefinition[];
};

type ApiPhonetic = {
  text?: string;
};

type ApiEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: ApiPhonetic[];
  meanings?: ApiMeaning[];
};

function firstPhonetic(entry: ApiEntry): string | null {
  if (entry.phonetic?.trim()) {
    return entry.phonetic.trim();
  }
  for (const item of entry.phonetics ?? []) {
    if (item.text?.trim()) {
      return item.text.trim();
    }
  }
  return null;
}

function wordInText(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

function firstExample(entry: ApiEntry, word: string): string | null {
  const withWord: string[] = [];
  const any: string[] = [];
  for (const meaning of entry.meanings ?? []) {
    for (const definition of meaning.definitions ?? []) {
      const example = definition.example?.trim();
      if (!example) continue;
      if (wordInText(example, word)) {
        withWord.push(example);
      } else {
        any.push(example);
      }
    }
  }
  return withWord[0] ?? any[0] ?? null;
}

export function parseDictionaryEntry(payload: unknown): DictionaryEnSense {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Word not found");
  }
  const entry = payload[0] as ApiEntry;
  const word = (entry.word ?? "").trim() || "unknown";
  const meaning = entry.meanings?.[0];
  const definition = meaning?.definitions?.[0];
  return {
    word,
    phoneticIpa: firstPhonetic(entry),
    partOfSpeech: meaning?.partOfSpeech?.trim() || null,
    definitionEn: definition?.definition?.trim() || null,
    exampleEn: firstExample(entry, word),
  };
}
