import { addDaysIso, isoNow } from "../../lib/dates";
import { isTauri } from "../../lib/tauri";
import { conversationDeckForBanks } from "../conversation";
import {
  communicationCardsForLevel,
  mergeCommunicationDecks,
  type CommunicationSourceCard,
} from "../conversation/merge";
import { studyModeFromStored } from "./study-mode";
import type {
  ContentType,
  FlashcardOutcome,
  Phrase,
  StudyFlashcard,
  SubmitAnswerResult,
  Vocabulary,
} from "../../types";
import { TOEIC_CARDS } from "../../data/toeic-cards";
import { SEED_PHRASES } from "../../data/seed-phrases";
import { PHASE1_PHRASES, PHASE1_VOCABULARY } from "../../data/lexicon/phase1";
import { peekCurrentUserId } from "../../db/current-user";
import { loadBrowserPet, rewardBrowserPetForUser } from "../pet-state/demo-pet";
import {
  getDueOrNewVocabularyByTopicIds,
  getLearningProgress,
  getSessionStats,
  insertStudySession,
  lastSessionDate,
  listPhrases,
  listTopicIdsByCodes,
  listVocabularyByTopicIds,
  upsertLearningProgress,
} from "../../db";
import {
  getActiveConversationBanks,
  getActiveLevelPreference,
  getActiveTopicCodes,
} from "../learning-program";
import { mapLegacyPhraseTopic } from "../learning-program/mapping";
import { assignVocabTopicCode } from "../learning-program/vocab-heuristic";
import type { TopicCode } from "../learning-program/catalog";
import {
  applyMissionProgress,
  applyXpAndRefresh,
  completeMissionXp,
  markPetFed,
  refreshUserProgress,
} from "../pet-state";
import { applyReview } from "./spaced-repetition";
import { shuffle } from "./deck";
import { countsTowardMastery, sessionIsCorrect, xpForOutcome } from "./outcome";
import { resolveVocabArt } from "./art";
import { isPlaceholderVocabWord } from "../../data/lexicon/quality";
import { resolveVocabUsage } from "../../data/lexicon/usage";

export { shuffle, nextDeckIndex, previousDeckIndex } from "./deck";
export { CARD_INTERVAL_MS, cardProgress, cardRemainingMs, shouldAdvanceCard } from "./timer";
export { shouldSpeakOnCard, shouldTickAdvance } from "./companion-study";
export { partOfSpeechLabel } from "./part-of-speech";
export { speakWord, cancelSpeech, ttsConfig } from "./speech";
export { xpForOutcome } from "./outcome";

function vocabToCard(item: Vocabulary): StudyFlashcard {
  const usage = resolveVocabUsage(item);
  return {
    contentId: item.id,
    contentType: "vocabulary",
    word: item.word,
    phonetic: usage.phonetic,
    partOfSpeech: item.partOfSpeech,
    meaning: usage.meaning,
    example: usage.example,
    exampleVi: usage.exampleVi,
    imageKey: resolveVocabArt({
      imageKey: item.imageKey,
      word: item.word,
      topic: item.topic,
    }),
    topic: item.topic,
  };
}

function browserVocabCards(active: TopicCode[]): StudyFlashcard[] {
  const fromPhase1 = active.flatMap((code) => {
    const rows = PHASE1_VOCABULARY[code] ?? [];
    return rows
      .filter((card) => !isPlaceholderVocabWord(card.word))
      .map((card, index) => {
        const usage = resolveVocabUsage(card);
        return {
          contentId: index + 1 + code.length * 10_000,
          contentType: "vocabulary" as const,
          word: card.word,
          phonetic: usage.phonetic,
          partOfSpeech: card.partOfSpeech,
          meaning: usage.meaning,
          example: usage.example,
          exampleVi: usage.exampleVi,
          imageKey: resolveVocabArt({
            imageKey: card.imageKey,
            word: card.word,
            topic: code,
          }),
          topic: code,
        };
      });
  });
  if (fromPhase1.length > 0) {
    return fromPhase1;
  }
  return TOEIC_CARDS.flatMap((card, index) => {
    const topic = assignVocabTopicCode(card.word);
    if (!topic || !active.includes(topic)) {
      return [];
    }
    return [
      {
        contentId: index + 1,
        contentType: "vocabulary" as const,
        word: card.word,
        phonetic: card.phonetic,
        partOfSpeech: card.partOfSpeech,
        meaning: card.meaning,
        example: card.example,
        exampleVi: card.exampleVi,
        imageKey: resolveVocabArt({
          imageKey: card.imageKey,
          word: card.word,
          topic,
        }),
        topic,
      },
    ];
  });
}

function phraseToCard(input: {
  contentId: number;
  word: string;
  meaning: string;
  phonetic: string | null;
  topic: string;
}): StudyFlashcard {
  return {
    contentId: input.contentId,
    contentType: "phrase",
    word: input.word,
    phonetic: input.phonetic,
    partOfSpeech: null,
    meaning: input.meaning,
    example: null,
    exampleVi: null,
    imageKey: resolveVocabArt({
      imageKey: `topic-${input.topic}`,
      word: input.word,
      topic: input.topic,
    }),
    topic: input.topic,
  };
}

function browserPhraseSources(active: TopicCode[]): CommunicationSourceCard[] {
  const fromPhase1 = active.flatMap((code) => {
    const rows = PHASE1_PHRASES[code] ?? [];
    return rows.map((item, index) => ({
      card: phraseToCard({
        contentId: index + 1 + code.length * 10_000,
        word: item.en,
        meaning: item.vi,
        phonetic: item.ipa || null,
        topic: code,
      }),
      level: item.level,
    }));
  });
  if (fromPhase1.length > 0) {
    return fromPhase1;
  }
  return SEED_PHRASES.flatMap((item) => {
    const topic = mapLegacyPhraseTopic(item.topic);
    if (!topic || !active.includes(topic)) {
      return [];
    }
    return [
      {
        card: phraseToCard({
          contentId: item.id,
          word: item.phraseEn,
          meaning: item.meaningVi,
          phonetic: null,
          topic,
        }),
        level: item.level,
      },
    ];
  });
}

async function tauriPhraseSources(active: TopicCode[]): Promise<CommunicationSourceCard[]> {
  const topicIds = await listTopicIdsByCodes(active);
  const rows = await listPhrases(topicIds);
  return rows.map((item: Phrase) => ({
    card: phraseToCard({
      contentId: item.id,
      word: item.phraseEn,
      meaning: item.meaningVi,
      phonetic: null,
      topic: item.topic,
    }),
    level: item.level,
  }));
}

async function communicationStudyDeck(): Promise<StudyFlashcard[]> {
  const active = await getActiveTopicCodes();
  const level = await getActiveLevelPreference();
  const banks = await getActiveConversationBanks();
  const conversations = conversationDeckForBanks(banks).map((card) => ({ card }));
  const phrases = isTauri() ? await tauriPhraseSources(active) : browserPhraseSources(active);
  return shuffle(communicationCardsForLevel(mergeCommunicationDecks(phrases, conversations), level));
}

export async function getStudyDeck(contentType: ContentType): Promise<StudyFlashcard[]> {
  if (studyModeFromStored(contentType) === "phrase") {
    return communicationStudyDeck();
  }

  const active = await getActiveTopicCodes();
  if (!isTauri()) {
    return shuffle(browserVocabCards(active));
  }

  const topicIds = await listTopicIdsByCodes(active);
  const due = await getDueOrNewVocabularyByTopicIds(isoNow(), topicIds);
  const all = await listVocabularyByTopicIds(topicIds);
  const ordered =
    due.length > 0 ? [...due, ...all.filter((item) => !due.some((d) => d.id === item.id))] : all;
  return shuffle(ordered.filter((item) => !isPlaceholderVocabWord(item.word))).map(vocabToCard);
}

export async function getNextCard(contentType: ContentType): Promise<StudyFlashcard | null> {
  const deck = await getStudyDeck(contentType);
  return deck[0] ?? null;
}

export async function recordFlashcardEvent(input: {
  contentType: ContentType;
  contentId: number;
  outcome: FlashcardOutcome;
  topic: string | null;
}): Promise<SubmitAnswerResult> {
  const xpGained = xpForOutcome(input.outcome);
  const isCorrect = sessionIsCorrect(input.outcome);

  if (!isTauri()) {
    const userId = peekCurrentUserId();
    const before = userId != null ? loadBrowserPet(userId) : null;
    const pet = userId != null ? rewardBrowserPetForUser(userId, xpGained) : null;
    return {
      isCorrect,
      outcome: input.outcome,
      xpGained,
      leveledUp: Boolean(before && pet && pet.level > before.level),
      completedMissions: [],
      pet,
    };
  }

  const prior = await getSessionStats(input.contentId, input.contentType);
  const isNew = prior.correctCount + prior.wrongCount === 0;
  const hadWrong = prior.wrongCount > 0 || input.outcome === "unknown";
  const previousLastDate = await lastSessionDate();
  const answeredAt = isoNow();

  await insertStudySession({
    contentId: input.contentId,
    contentType: input.contentType,
    isCorrect,
    answeredAt,
  });

  if (input.contentType === "vocabulary") {
    const existing = await getLearningProgress(input.contentId);
    if (countsTowardMastery(input.outcome) || input.outcome === "unknown") {
      const reviewed = applyReview({
        correctCount: existing?.correctCount ?? 0,
        wrongCount: existing?.wrongCount ?? 0,
        wasCorrect: input.outcome === "known",
      });
      await upsertLearningProgress({
        vocabularyId: input.contentId,
        correctCount: reviewed.correctCount,
        wrongCount: reviewed.wrongCount,
        lastReviewedAt: answeredAt,
        nextReviewAt: addDaysIso(answeredAt, reviewed.intervalDays),
        status: reviewed.status,
      });
    } else {
      await upsertLearningProgress({
        vocabularyId: input.contentId,
        correctCount: existing?.correctCount ?? 0,
        wrongCount: existing?.wrongCount ?? 0,
        lastReviewedAt: answeredAt,
        nextReviewAt: addDaysIso(answeredAt, 1),
        status: existing?.status === "mastered" ? "mastered" : "learning",
      });
    }
  }

  await refreshUserProgress(new Date(), previousLastDate);

  const completedMissions = await applyMissionProgress({
    isNew,
    hadWrong: input.outcome === "unknown" ? true : hadWrong,
    isCorrect,
    contentType: input.contentType,
    topic: input.topic,
  });

  let leveledUp = false;
  let pet = null;
  if (completedMissions.length > 0) {
    const missionXp = await completeMissionXp(completedMissions);
    leveledUp = missionXp.leveledUp;
    pet = missionXp.pet;
  }
  if (xpGained > 0) {
    const xpResult = await applyXpAndRefresh(xpGained);
    leveledUp = leveledUp || xpResult.leveledUp;
    pet = xpResult.pet;
  }

  pet = await markPetFed(answeredAt);
  return { isCorrect, outcome: input.outcome, xpGained, leveledUp, completedMissions, pet };
}
