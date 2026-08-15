import type { TopicCode } from "./catalog";

export const MIN_PROGRAM_CONTENT = 15;

export function canSaveTopicSelection(selected: TopicCode[]): boolean {
  return selected.length >= 1;
}

export function shouldWarnLowContent(itemCount: number, minimum = MIN_PROGRAM_CONTENT): boolean {
  return itemCount < minimum;
}

export function toggleTopicSelection(
  selected: TopicCode[],
  code: TopicCode,
): { next: TopicCode[]; blocked: boolean } {
  if (selected.includes(code)) {
    if (selected.length <= 1) {
      return { next: selected, blocked: true };
    }
    return { next: selected.filter((item) => item !== code), blocked: false };
  }
  return { next: [...selected, code], blocked: false };
}

export function pickRandomTopicCode(active: TopicCode[], random = Math.random): TopicCode | null {
  if (active.length === 0) {
    return null;
  }
  const index = Math.floor(random() * active.length);
  return active[index] ?? null;
}

export function defaultContentTypeFromPreference(
  preference: "vocabulary" | "phrase" | "both",
): "vocabulary" | "phrase" {
  if (preference === "phrase") {
    return "phrase";
  }
  return "vocabulary";
}
