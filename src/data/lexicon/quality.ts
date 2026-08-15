const PLACEHOLDER_TERM = /^[a-z]+(?:[-_][a-z]+)*-term-\d+$/i;
const PLACEHOLDER_ITEM = /^item[a-z]+\d+$/i;
const DUMMY_IPA = /^\/\s*·\s*\/$/;

export function isPlaceholderVocabWord(word: string): boolean {
  const value = word.trim();
  return PLACEHOLDER_TERM.test(value) || PLACEHOLDER_ITEM.test(value);
}

export function usableVocabPhonetic(phonetic: string | null | undefined): string | null {
  if (!phonetic) {
    return null;
  }
  const trimmed = phonetic.trim();
  if (!trimmed || DUMMY_IPA.test(trimmed)) {
    return null;
  }
  return trimmed;
}
