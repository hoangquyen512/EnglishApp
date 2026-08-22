const PLACEHOLDER_TERM = /^[a-z]+(?:[-_][a-z]+)*-term-\d+$/i;
const PLACEHOLDER_ITEM = /^item[a-z]+\d+$/i;
const DUMMY_IPA = /^\/\s*·\s*\/$/;
const PLACEHOLDER_EXAMPLE =
  /please remember the word\b|^hãy nhớ từ\b|\bin [a-z_]+ context\.?$|\btrong ngữ cảnh [a-z_]+\.?$/i;

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

export function isPlaceholderVocabExample(example: string | null | undefined): boolean {
  const trimmed = example?.trim();
  if (!trimmed) {
    return true;
  }
  return PLACEHOLDER_EXAMPLE.test(trimmed);
}

export function usableVocabExample(example: string | null | undefined): string | null {
  const trimmed = example?.trim();
  if (!trimmed || isPlaceholderVocabExample(trimmed)) {
    return null;
  }
  return trimmed;
}

export function usableVocabMeaning(word: string, meaning: string | null | undefined): string | null {
  const trimmed = meaning?.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.toLowerCase() === word.trim().toLowerCase()) {
    return null;
  }
  if (isPlaceholderVocabExample(trimmed)) {
    return null;
  }
  return trimmed;
}
