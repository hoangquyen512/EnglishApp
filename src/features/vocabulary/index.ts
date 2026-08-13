import { addDaysIso, isoNow } from "../../lib/dates";
import { isTauri } from "../../lib/tauri";
import type {
  ContentType,
  FlashcardOutcome,
  PhraseTopic,
  StudyFlashcard,
  SubmitAnswerResult,
  Vocabulary,
} from "../../types";
import { TOEIC_CARDS } from "../../data/toeic-cards";
import { DEMO_PET } from "../../data/demo-pet";
import {
  getDueOrNewVocabulary,
  getLearningProgress,
  getSessionStats,
  insertStudySession,
  lastSessionDate,
  listPhrases,
  listUnseenOrWrongPhrases,
  listVocabulary,
  upsertLearningProgress,
} from "../../db";
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
export { speakWord, cancelSpeech, ttsConfig } from "./speech";
export { xpForOutcome } from "./outcome";

function seedCards(): StudyFlashcard[] {
  return TOEIC_CARDS.map((card, index) => ({
    contentId: index + 1,
    contentType: "vocabulary" as const,
    word: card.word,
    phonetic: card.phonetic,
    partOfSpeech: card.partOfSpeech,
    meaning: card.meaning,
    example: card.example,
    exampleVi: card.exampleVi,
    imageKey: card.imageKey,
    topic: null,
  }));
}

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
    topic: null,
  };
}

export async function getStudyDeck(
  contentType: ContentType,
  topic: PhraseTopic | null,
): Promise<StudyFlashcard[]> {
  if (!isTauri()) {
    if (contentType === "phrase") {
      return seedCards().slice(0, 4).map((card, index) => ({
        ...card,
        contentId: 100 + index,
        contentType: "phrase",
        topic: topic ?? "office",
      }));
    }
    return seedCards();
  }

  if (contentType === "vocabulary") {
    const due = await getDueOrNewVocabulary(isoNow());
    const all = await listVocabulary();
    const ordered = due.length > 0 ? [...due, ...all.filter((item) => !due.some((d) => d.id === item.id))] : all;
    return shuffle(ordered).map(vocabToCard);
  }

  const candidates = await listUnseenOrWrongPhrases(topic);
  const fallback = candidates.length > 0 ? candidates : await listPhrases(topic);
  return shuffle(fallback).map((item) => ({
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

export async function getNextCard(
  contentType: ContentType,
  topic: PhraseTopic | null,
): Promise<StudyFlashcard | null> {
  const deck = await getStudyDeck(contentType, topic);
  return deck[0] ?? null;
}

export async function recordFlashcardEvent(input: {
  contentType: ContentType;
  contentId: number;
  outcome: FlashcardOutcome;
  topic: PhraseTopic | null;
}): Promise<SubmitAnswerResult> {
  const xpGained = xpForOutcome(input.outcome);
  const isCorrect = sessionIsCorrect(input.outcome);

  if (!isTauri()) {
    return {
      isCorrect,
      outcome: input.outcome,
      xpGained,
      leveledUp: false,
      completedMissions: [],
      pet: DEMO_PET,
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
