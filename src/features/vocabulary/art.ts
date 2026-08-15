import { TOEIC_ART_KEYS } from "../../data/toeic-cards";
import { illustrationSrc } from "../conversation/illustration";

const ART_FILE_KEYS = new Set(TOEIC_ART_KEYS);
const ART_SLOTS = 8;

function artSlot(seed: string): number {
  let sum = 0;
  for (const ch of seed) {
    sum += ch.charCodeAt(0);
  }
  return (sum % ART_SLOTS) + 1;
}

export function resolveVocabArt(input: {
  imageKey: string | null | undefined;
  word: string;
  topic: string | null | undefined;
}): string {
  const key = (input.imageKey ?? input.word).trim();
  if (key.startsWith("http") || key.startsWith("data:") || key.startsWith("/")) {
    return key;
  }
  if (ART_FILE_KEYS.has(key)) {
    return `/arts/${key}.jpg`;
  }
  const topic = input.topic?.trim() || "family";
  return illustrationSrc(`${topic}-${artSlot(input.word || key)}`);
}
