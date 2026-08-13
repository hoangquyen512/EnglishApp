import { CORRECT_ANSWER_XP } from "../../constants/pet";
import { addDaysIso, isoNow } from "../../lib/dates";
import type { ContentType, PhraseTopic, QuizCard, QuizChoice, SubmitAnswerResult } from "../../types";
import {
  getDueOrNewVocabulary,
  getLearningProgress,
  getPhraseById,
  getSessionStats,
  getVocabularyById,
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
import { buildChoices, shuffle } from "./quiz";

function toChoices(correct: string, options: string[]): QuizChoice[] {
  return options.map((text, index) => ({
    id: `${index}-${text}`,
    text,
    isCorrect: text === correct,
  }));
}

export async function getNextCard(
  contentType: ContentType,
  topic: PhraseTopic | null,
): Promise<QuizCard | null> {
  if (contentType === "vocabulary") {
    const due = await getDueOrNewVocabulary(isoNow());
    const all = due.length > 0 ? due : await listVocabulary();
    const promptItem = shuffle(all)[0];
    if (!promptItem) {
      return null;
    }
    const meanings = (await listVocabulary()).map((item) => item.meaning);
    const choices = toChoices(promptItem.meaning, buildChoices(promptItem.meaning, meanings));
    return {
      contentId: promptItem.id,
      contentType,
      prompt: promptItem.word,
      example: promptItem.example,
      topic: null,
      choices,
      correctAnswer: promptItem.meaning,
    };
  }

  const candidates = await listUnseenOrWrongPhrases(topic);
  const fallback = candidates.length > 0 ? candidates : await listPhrases(topic);
  const promptItem = shuffle(fallback)[0];
  if (!promptItem) {
    return null;
  }
  const meanings = (await listPhrases()).map((item) => item.meaningVi);
  const choices = toChoices(promptItem.meaningVi, buildChoices(promptItem.meaningVi, meanings));
  return {
    contentId: promptItem.id,
    contentType,
    prompt: promptItem.phraseEn,
    example: null,
    topic: promptItem.topic,
    choices,
    correctAnswer: promptItem.meaningVi,
  };
}

export async function submitAnswer(input: {
  contentType: ContentType;
  contentId: number;
  selectedText: string;
  topic: PhraseTopic | null;
}): Promise<SubmitAnswerResult> {
  const prior = await getSessionStats(input.contentId, input.contentType);
  const isNew = prior.correctCount + prior.wrongCount === 0;
  const hadWrong = prior.wrongCount > 0;
  const previousLastDate = await lastSessionDate();

  let correctAnswer = "";
  if (input.contentType === "vocabulary") {
    const vocab = await getVocabularyById(input.contentId);
    correctAnswer = vocab?.meaning ?? "";
  } else {
    const phrase = await getPhraseById(input.contentId);
    correctAnswer = phrase?.meaningVi ?? "";
  }
  const isCorrect = input.selectedText === correctAnswer;
  const answeredAt = isoNow();

  await insertStudySession({
    contentId: input.contentId,
    contentType: input.contentType,
    isCorrect,
    answeredAt,
  });

  if (input.contentType === "vocabulary") {
    const existing = await getLearningProgress(input.contentId);
    const reviewed = applyReview({
      correctCount: existing?.correctCount ?? 0,
      wrongCount: existing?.wrongCount ?? 0,
      wasCorrect: isCorrect,
    });
    await upsertLearningProgress({
      vocabularyId: input.contentId,
      correctCount: reviewed.correctCount,
      wrongCount: reviewed.wrongCount,
      lastReviewedAt: answeredAt,
      nextReviewAt: addDaysIso(answeredAt, reviewed.intervalDays),
      status: reviewed.status,
    });
  }

  await refreshUserProgress(new Date(), previousLastDate);

  const completedMissions = await applyMissionProgress({
    isNew,
    hadWrong,
    isCorrect,
    contentType: input.contentType,
    topic: input.topic,
  });

  let leveledUp = false;
  if (completedMissions.length > 0) {
    const missionXp = await completeMissionXp(completedMissions);
    leveledUp = missionXp.leveledUp;
  }
  if (isCorrect) {
    const xpResult = await applyXpAndRefresh(CORRECT_ANSWER_XP);
    leveledUp = leveledUp || xpResult.leveledUp;
  }

  const pet = await markPetFed(answeredAt);
  return { isCorrect, leveledUp, completedMissions, pet };
}
