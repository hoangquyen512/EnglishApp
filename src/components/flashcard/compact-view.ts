import { studyModeFromStored } from "../../features/vocabulary/study-mode";
import type { ContentType } from "../../types";

export function compactFlashcardView(card: { contentType: ContentType }) {
  const communication = studyModeFromStored(card.contentType) === "phrase";
  return {
    showIllustration: true,
    showPhonetic: !communication,
    showPartOfSpeech: !communication,
    showExample: !communication,
    showExampleVi: !communication,
  };
}
