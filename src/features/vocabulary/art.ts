import { TOEIC_ART_KEYS } from "../../data/toeic-cards";
import { resolveCommunicationArt } from "../conversation/illustration";

const ART_FILE_KEYS = new Set(TOEIC_ART_KEYS);

export function resolveVocabArt(input: {
  imageKey: string | null | undefined;
  word: string;
  topic: string | null | undefined;
  example?: string | null;
}): string {
  const key = (input.imageKey ?? input.word).trim();
  if (key.startsWith("http") || key.startsWith("data:") || key.startsWith("/")) {
    return key;
  }
  if (ART_FILE_KEYS.has(key)) {
    return `/arts/${key}.jpg`;
  }

  const sentence = input.example?.trim() || input.word.trim();
  return resolveCommunicationArt({
    sentence,
    topic: input.topic,
  });
}
