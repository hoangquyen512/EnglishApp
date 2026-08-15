import type { CefrLevelPreference } from "./catalog";

const ORDER: CefrLevelPreference[] = ["A1", "A2", "B1", "B2"];

export function cefrRank(level: string): number {
  const index = ORDER.indexOf(level as CefrLevelPreference);
  return index >= 0 ? index : -1;
}

/** Keep phrases at or below the user's preferred CEFR. */
export function phraseLevelAllowed(phraseLevel: string, preference: CefrLevelPreference): boolean {
  const phraseRank = cefrRank(phraseLevel);
  const prefRank = cefrRank(preference);
  if (phraseRank < 0 || prefRank < 0) {
    return true;
  }
  return phraseRank <= prefRank;
}
