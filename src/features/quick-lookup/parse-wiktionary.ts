import type { DictionaryEnSense } from "./types";
import { extractIpa } from "./phonetic";

type WikiDef = {
  definition?: string;
  examples?: string[];
};

type WikiSense = {
  partOfSpeech?: string;
  definitions?: WikiDef[];
};

function stripHtml(raw: string): string {
  return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function firstWikiIpa(senses: WikiSense[] | undefined): string | null {
  for (const item of senses ?? []) {
    for (const def of item.definitions ?? []) {
      const raw = def.definition?.trim();
      if (!raw) continue;
      const ipa = extractIpa(stripHtml(raw)) ?? extractIpa(raw);
      if (ipa) return ipa;
    }
  }
  return null;
}

export function parseWiktionaryDefinition(word: string, payload: unknown): DictionaryEnSense {
  const record = payload as { en?: WikiSense[] };
  const sense = record.en?.[0];
  const definition = sense?.definitions?.[0];
  const text = definition?.definition ? stripHtml(definition.definition) : "";
  if (!text) {
    throw new Error("Word not found");
  }
  let exampleEn: string | null = null;
  for (const item of record.en ?? []) {
    for (const def of item.definitions ?? []) {
      const raw = def.examples?.[0];
      if (raw) {
        exampleEn = stripHtml(raw);
        break;
      }
    }
    if (exampleEn) break;
  }
  return {
    word,
    phoneticIpa: firstWikiIpa(record.en),
    partOfSpeech: sense?.partOfSpeech?.trim().toLowerCase() || null,
    definitionEn: text,
    exampleEn,
  };
}
