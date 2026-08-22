import { PHASE1_PHRASES } from "../../data/lexicon/phase1";
import { SEED_PHRASES } from "../../data/seed-phrases";
import { conversationTopics } from "../../data/conversation/topics";
import { mapLegacyPhraseTopic } from "../learning-program/mapping";
import { ART_PREFIX } from "./ids";

const ART_SLOTS = 8;

const SCENE_KEYWORD_RULES: ReadonlyArray<{ pattern: RegExp; prefix: string }> = [
  {
    pattern:
      /\b(water|latte|coffee|tea|juice|menu|sandwich|burger|pizza|noodle|rice|meal|breakfast|lunch|dinner|drink|smoothie|milk|sugar|espresso|cappuccino|mocha|matcha|lemonade|chocolate|sparkling|coconut|iced|hot chocolate)\b/i,
    prefix: "cafe",
  },
  { pattern: /\b(restaurant|dining|waiter|bill|tip|table for)\b/i, prefix: "rest" },
  {
    pattern: /\b(hotel|room|check[- ]?in|checkout|reception|housekeeping|luggage|key card)\b/i,
    prefix: "hotel",
  },
  {
    pattern: /\b(airport|flight|gate|boarding|passport|customs|baggage|terminal|runway|pilot)\b/i,
    prefix: "air",
  },
  { pattern: /\b(station|bus|train|subway|metro|direction|turn left|turn right|map)\b/i, prefix: "dir" },
  { pattern: /\b(shop|store|price|discount|receipt|return|exchange|try on)\b/i, prefix: "shop" },
  { pattern: /\b(doctor|hospital|medicine|pharmacy|headache|fever|sick|pain|appointment)\b/i, prefix: "health" },
  { pattern: /\b(emergency|help|police|ambulance|fire|danger)\b/i, prefix: "emg" },
  { pattern: /\b(phone|call|message|email|wifi|password|app|social)\b/i, prefix: "phone" },
  { pattern: /\b(office|meeting|report|deadline|colleague|boss|interview|resume)\b/i, prefix: "work" },
  {
    pattern: /\b(family|mother|father|sister|brother|parent|child|husband|wife|relative)\b/i,
    prefix: "fam",
  },
  { pattern: /\b(hello|good morning|good evening|nice to meet|how are you|goodbye|see you)\b/i, prefix: "greet" },
];

/** Strip time openers so home/study cards can match canonical phrase art. */
export function normalizeCommunicationSentence(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(
      /^(?:(?:this|today|tonight|tomorrow)\s+(?:morning|afternoon|evening)|now),\s*/,
      "",
    )
    .replace(/[.!?]+$/g, "");
}

function defaultPrefixFromPhraseId(phraseId: string): string {
  const dash = phraseId.lastIndexOf("-");
  const rawPrefix = dash === -1 ? "greet" : phraseId.slice(0, dash);
  return ART_PREFIX[rawPrefix] ?? "greet";
}

function slotFromPhraseId(phraseId: string): number {
  const dash = phraseId.lastIndexOf("-");
  const n = Number(phraseId.slice(dash + 1));
  return Number.isFinite(n) && n > 0 ? ((n - 1) % ART_SLOTS) + 1 : 1;
}

function slotFromSeed(seed: string): number {
  let sum = 0;
  for (const ch of seed) {
    sum += ch.charCodeAt(0);
  }
  return (sum % ART_SLOTS) + 1;
}

function scenePrefixForSentence(sentence: string, fallback: string): string {
  for (const rule of SCENE_KEYWORD_RULES) {
    if (rule.pattern.test(sentence)) {
      return rule.prefix;
    }
  }
  return fallback;
}

export function illustrationSrcForPhrase(phraseId: string, sentence?: string | null): string {
  const fallback = defaultPrefixFromPhraseId(phraseId);
  const prefix = sentence?.trim() ? scenePrefixForSentence(sentence, fallback) : fallback;
  const slot = slotFromPhraseId(phraseId);
  return `/illustrations/${prefix}-${slot}.jpg`;
}

export function illustrationSrc(phraseId: string): string {
  return illustrationSrcForPhrase(phraseId);
}

let phraseIndex: Map<string, string> | null = null;

function buildPhraseIllustrationIndex(): Map<string, string> {
  const index = new Map<string, string>();
  const add = (en: string, id: string) => {
    const key = normalizeCommunicationSentence(en);
    if (!index.has(key)) {
      index.set(key, id);
    }
  };

  for (const topic of conversationTopics) {
    for (const phrase of topic.phrases) {
      add(phrase.en, phrase.id);
    }
  }

  for (const [topicCode, rows] of Object.entries(PHASE1_PHRASES)) {
    for (const phrase of rows) {
      add(phrase.en, phrase.id || `${topicCode}-0`);
    }
  }

  for (const phrase of SEED_PHRASES) {
    const topic = mapLegacyPhraseTopic(phrase.topic) ?? phrase.topic;
    add(phrase.phraseEn, `${topic}-${phrase.id}`);
  }

  return index;
}

function phraseIllustrationIndex(): Map<string, string> {
  phraseIndex ??= buildPhraseIllustrationIndex();
  return phraseIndex;
}

/** Resolve a study-card illustration from the English sentence (and optional phrase id). */
export function resolveCommunicationArt(input: {
  sentence: string;
  topic?: string | null;
  phraseId?: string | null;
}): string {
  const sentence = input.sentence.trim();
  if (!sentence) {
    return "/illustrations/fam-1.jpg";
  }

  const normalized = normalizeCommunicationSentence(sentence);
  const matchedId = phraseIllustrationIndex().get(normalized);
  if (matchedId) {
    return illustrationSrcForPhrase(matchedId, sentence);
  }

  if (input.phraseId?.trim()) {
    return illustrationSrcForPhrase(input.phraseId.trim(), sentence);
  }

  const topicPrefix = ART_PREFIX[input.topic?.trim() ?? ""] ?? "fam";
  const prefix = scenePrefixForSentence(sentence, topicPrefix);
  const slot = slotFromSeed(normalized);
  return `/illustrations/${prefix}-${slot}.jpg`;
}
