import { CHOICE_COUNT } from "../../constants/study";

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = copy[i];
    const swap = copy[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    copy[i] = swap;
    copy[j] = current;
  }
  return copy;
}

export function buildChoices(
  correct: string,
  pool: string[],
  total = CHOICE_COUNT,
  random = Math.random,
): string[] {
  const distractors = shuffle(
    [...new Set(pool.filter((item) => item !== correct))],
    random,
  ).slice(0, Math.max(total - 1, 0));
  return shuffle([correct, ...distractors], random);
}
