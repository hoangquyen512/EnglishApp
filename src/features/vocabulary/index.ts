import { addDaysIso, isoNow } from "../../lib/dates";
import { isTauri } from "../../lib/tauri";
import { conversationDeckForBanks } from "../conversation";
import type {
  ContentType,
  FlashcardOutcome,
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
  listUnseenOrWrongPhrases,
  listVocabularyByTopicIds,
  upsertLearningProgress,
} from "../../db";
import {
  getActiveConversationBanks,
  getActiveLevelPreference,
  getActiveTopicCodes,
} from "../learning-program";
import { mapLegacyPhraseTopic } from "../learning-program/mapping";
import { phraseLevelAllowed } from "../learning-program/level";
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

export { shuffle, nextDeckIndex, previousDeckIndex } from "./deck";
export { CARD_INTERVAL_MS, cardProgress, cardRemainingMs, shouldAdvanceCard } from "./timer";
export { shouldSpeakOnCard, shouldTickAdvance } from "./companion-study";
export { partOfSpeechLabel } from "./part-of-speech";
export { speakWord, cancelSpeech, ttsConfig } from "./speech";
export { xpForOutcome } from "./outcome";

function vocabToCard(item: Vocabulary): StudyFlashcard {
  return {
    contentId: item.id,
    contentType: "vocabulary",
    word: item.word,
    phonetic: item.phonetic,
    partOfSpeech: item.partOfSpeech,
    meaning: item.meaning,
    example: item.example,
    exampleVi: item.exampleVi,
    imageKey: item.imageKey ?? item.word,
    topic: item.topic,
  };
}

function browserVocabCards(active: TopicCode[]): StudyFlashcard[] {
  const fromPhase1 = active.flatMap((code) => {
    const rows = PHASE1_VOCABULARY[code] ?? [];
    return rows.map((card, index) => ({
      contentId: index + 1 + code.length * 10_000,
      contentType: "vocabulary" as const,
      word: card.word,
      phonetic: card.phonetic,
      partOfSpeech: card.partOfSpeech,
      meaning: card.meaning,
      example: card.example,
      exampleVi: card.exampleVi,
      imageKey: card.imageKey,
      topic: code,
    }));
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
        imageKey: card.imageKey,
        topic,
      },
    ];
  });
}

function browserPhraseCards(active: TopicCode[], level: "A1" | "A2" | "B1" | "B2"): StudyFlashcard[] {
  const fromPhase1 = active.flatMap((code) => {
    const rows = PHASE1_PHRASES[code] ?? [];
    return rows
      .filter((item) => phraseLevelAllowed(item.level, level))
      .map((item, index) => ({
        contentId: index + 1 + code.length * 10_000,
        contentType: "phrase" as const,
        word: item.en,
        phonetic: item.ipa || null,
        partOfSpeech: null,
        meaning: item.vi,
        example: null,
        exampleVi: null,
        imageKey: `topic-${code}`,
        topic: code,
      }));
  });
  if (fromPhase1.length > 0) {
    return fromPhase1;
  }
  return SEED_PHRASES.flatMap((item) => {
    const topic = mapLegacyPhraseTopic(item.topic);
    if (!topic || !active.includes(topic) || !phraseLevelAllowed(item.level, level)) {
      return [];
    }
    return [
      {
        contentId: item.id,
        contentType: "phrase" as const,
        word: item.phraseEn,
        phonetic: null,
        partOfSpeech: null,
        meaning: item.meaningVi,
        example: null,
        exampleVi: null,
        imageKey: `topic-${topic}`,
        topic,
      },
    ];
  });
}

export async function getStudyDeck(contentType: ContentType): Promise<StudyFlashcard[]> {
  const active = await getActiveTopicCodes();

  if (contentType === "conversation") {
    const banks = await getActiveConversationBanks();
    return shuffle(conversationDeckForBanks(banks));
  }

  if (!isTauri()) {
    if (contentType === "phrase") {
      const level = await getActiveLevelPreference();
      return shuffle(browserPhraseCards(active, level));
    }
    return shuffle(browserVocabCards(active));
  }

  const topicIds = await listTopicIdsByCodes(active);
  if (contentType === "vocabulary") {
    const due = await getDueOrNewVocabularyByTopicIds(isoNow(), topicIds);
    const all = await listVocabularyByTopicIds(topicIds);
    const ordered =
      due.length > 0 ? [...due, ...all.filter((item) => !due.some((d) => d.id === item.id))] : all;
    return shuffle(ordered).map(vocabToCard);
  }

  const level = await getActiveLevelPreference();
  const candidates = await listUnseenOrWrongPhrases(topicIds);
  const fallback = candidates.length > 0 ? candidates : await listPhrases(topicIds);
  const filtered = fallback.filter((item) => phraseLevelAllowed(item.level, level));
  return shuffle(filtered).map((item) => ({
    contentId: item.id,
    contentType: "phrase" as const,
    word: item.phraseEn,
    phonetic: null,
    partOfSpeech: null,
    meaning: item.meaningVi,
    example: null,
    exampleVi: null,
    imageKey: `topic-${item.topic}`,
    topic: item.topic,
  }));
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
