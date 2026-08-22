import extras from "./phonetics.json";
import meanings from "./meanings.json";
import { conversationTopics } from "../conversation/topics";
import { TOEIC_CARDS } from "../toeic-cards";
import { PHASE1_PHRASES } from "./phase1";
import { usableVocabExample, usableVocabMeaning, usableVocabPhonetic } from "./quality";

const TOEIC_BY_WORD = new Map(TOEIC_CARDS.map((card) => [card.word.toLowerCase(), card]));
const PHONETICS_BY_WORD = extras as Record<string, string>;
const MEANINGS_BY_WORD = meanings as Record<string, string>;

interface ExampleHit {
  example: string;
  exampleVi: string;
}

function sentenceWords(en: string): string[] {
  return en.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];
}

function buildExampleIndex(): Map<string, ExampleHit> {
  const index = new Map<string, ExampleHit>();
  const addSentence = (en: string, vi: string) => {
    const example = en.trim();
    const exampleVi = vi.trim();
    if (!example || !exampleVi) {
      return;
    }
    for (const word of sentenceWords(example)) {
      if (!index.has(word)) {
        index.set(word, { example, exampleVi });
      }
    }
  };
  for (const topic of conversationTopics) {
    for (const phrase of topic.phrases) {
      addSentence(phrase.en, phrase.vi);
    }
  }
  for (const rows of Object.values(PHASE1_PHRASES)) {
    for (const phrase of rows) {
      addSentence(phrase.en, phrase.vi);
    }
  }
  return index;
}

const EXAMPLE_BY_WORD = buildExampleIndex();

export interface VocabUsageInput {
  word: string;
  phonetic?: string | null;
  meaning?: string | null;
  example?: string | null;
  exampleVi?: string | null;
  partOfSpeech?: string | null;
}

function compactGloss(text: string | undefined): string | null {
  const trimmed = text?.trim();
  if (!trimmed) {
    return null;
  }
  const first = trimmed.split(/\s*[,;|/]\s*/)[0]?.trim() ?? trimmed;
  return first.replace(/[.]+$/g, "").trim() || null;
}

export function fallbackVocabExample(
  word: string,
  meaning: string,
  partOfSpeech: string | null | undefined,
): ExampleHit {
  const pos = (partOfSpeech ?? "").toLowerCase();
  if (pos.startsWith("v")) {
    return {
      example: `They ${word} it from their family.`,
      exampleVi: `Họ ${meaning} từ gia đình.`,
    };
  }
  if (pos.startsWith("adv") || pos === "adv.") {
    return {
      example: `Please do it ${word}.`,
      exampleVi: `Hãy làm ${meaning}.`,
    };
  }
  if (pos.startsWith("adj") || pos.startsWith("a.")) {
    return {
      example: `This is ${word}.`,
      exampleVi: `Điều này thì ${meaning}.`,
    };
  }
  return {
    example: `I learned about this ${word} today.`,
    exampleVi: `Hôm nay tôi học về ${meaning}.`,
  };
}

export function resolveVocabUsage(input: VocabUsageInput): {
  phonetic: string | null;
  meaning: string;
  example: string | null;
  exampleVi: string | null;
} {
  const word = input.word.trim();
  const key = word.toLowerCase();
  const toeic = TOEIC_BY_WORD.get(key);
  const spoken = EXAMPLE_BY_WORD.get(key);
  const meaning =
    usableVocabMeaning(word, input.meaning) ??
    usableVocabMeaning(word, toeic?.meaning) ??
    usableVocabMeaning(word, compactGloss(MEANINGS_BY_WORD[key])) ??
    input.meaning?.trim() ??
    word;
  const gloss = usableVocabMeaning(word, meaning);
  const generated = gloss ? fallbackVocabExample(word, gloss, input.partOfSpeech ?? toeic?.partOfSpeech) : null;
  return {
    phonetic:
      usableVocabPhonetic(input.phonetic) ??
      usableVocabPhonetic(toeic?.phonetic) ??
      usableVocabPhonetic(PHONETICS_BY_WORD[key]) ??
      null,
    meaning,
    example:
      usableVocabExample(input.example) ??
      usableVocabExample(toeic?.example) ??
      spoken?.example ??
      generated?.example ??
      null,
    exampleVi:
      usableVocabExample(input.exampleVi) ??
      usableVocabExample(toeic?.exampleVi) ??
      spoken?.exampleVi ??
      generated?.exampleVi ??
      null,
  };
}
