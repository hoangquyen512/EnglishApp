import type { Phrase, QuizQuestion } from '../types'

function shuffle<T>(items: T[], random = Math.random): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function buildQuizQuestion(
  phrase: Phrase,
  pool: Phrase[],
  random = Math.random,
): QuizQuestion {
  const distractors = shuffle(
    pool.filter((item) => item.id !== phrase.id),
    random,
  )
    .slice(0, 3)
    .map((item) => item.en)

  while (distractors.length < 3) {
    distractors.push(`I am not sure about this yet. (${distractors.length})`)
  }

  const options = shuffle([phrase.en, ...distractors], random)
  return {
    phraseId: phrase.id,
    promptVi: phrase.vi,
    promptEn: phrase.en,
    options,
    correctIndex: options.indexOf(phrase.en),
  }
}

export function nextUnmastered(
  phrases: Phrase[],
  masteredIds: Set<string>,
  afterId?: string,
): Phrase | undefined {
  const start = afterId ? phrases.findIndex((phrase) => phrase.id === afterId) + 1 : 0
  const ordered = [...phrases.slice(start), ...phrases.slice(0, start)]
  return ordered.find((phrase) => !masteredIds.has(phrase.id)) ?? ordered[0]
}

export const QUIZ_ROUND = 10
export const REVIEW_ROUND = 20

export function samplePhrases(
  phrases: Phrase[],
  count: number,
  random = Math.random,
): Phrase[] {
  return shuffle(phrases, random).slice(0, Math.min(count, phrases.length))
}

export function scorePercent(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}
