import type { PhraseProgress, ProgressState, Topic, TopicStats } from '../types'

export const STORAGE_KEY = 'english-app.progress.v1'
export const MASTERY_STREAK = 2

export function emptyProgress(): PhraseProgress {
  return {
    seen: false,
    correctStreak: 0,
    mastered: false,
    lastReviewedAt: null,
  }
}

export function emptyState(): ProgressState {
  return { phrases: {}, saved: [] }
}

export function getPhraseProgress(
  state: ProgressState,
  phraseId: string,
): PhraseProgress {
  return state.phrases[phraseId] ?? emptyProgress()
}

export function markSeen(state: ProgressState, phraseId: string): ProgressState {
  const current = getPhraseProgress(state, phraseId)
  return {
    ...state,
    phrases: {
      ...state.phrases,
      [phraseId]: {
        ...current,
        seen: true,
        lastReviewedAt: Date.now(),
      },
    },
  }
}

export function markAnswer(
  state: ProgressState,
  phraseId: string,
  correct: boolean,
  now = Date.now(),
): ProgressState {
  const current = getPhraseProgress(state, phraseId)
  const streak = correct ? current.correctStreak + 1 : 0
  return {
    ...state,
    phrases: {
      ...state.phrases,
      [phraseId]: {
        seen: true,
        correctStreak: streak,
        mastered: streak >= MASTERY_STREAK,
        lastReviewedAt: now,
      },
    },
  }
}

export function toggleSaved(state: ProgressState, phraseId: string): ProgressState {
  const saved = state.saved.includes(phraseId)
    ? state.saved.filter((id) => id !== phraseId)
    : [...state.saved, phraseId]
  return { ...state, saved }
}

export function isSaved(state: ProgressState, phraseId: string): boolean {
  return state.saved.includes(phraseId)
}

export function topicStats(state: ProgressState, topic: Topic): TopicStats {
  const total = topic.phrases.length
  let seen = 0
  let mastered = 0
  for (const phrase of topic.phrases) {
    const progress = getPhraseProgress(state, phrase.id)
    if (progress.seen) seen += 1
    if (progress.mastered) mastered += 1
  }
  return { total, seen, mastered }
}

export function overallStats(state: ProgressState, topics: Topic[]): TopicStats {
  return topics.reduce(
    (acc, topic) => {
      const stats = topicStats(state, topic)
      return {
        total: acc.total + stats.total,
        seen: acc.seen + stats.seen,
        mastered: acc.mastered + stats.mastered,
      }
    },
    { total: 0, seen: 0, mastered: 0 },
  )
}

export function reviewPhraseIds(state: ProgressState, topics: Topic[]): string[] {
  const ids: string[] = []
  for (const topic of topics) {
    for (const phrase of topic.phrases) {
      const progress = getPhraseProgress(state, phrase.id)
      if (progress.seen && !progress.mastered) ids.push(phrase.id)
    }
  }
  return ids
}

export function loadState(storage: Pick<Storage, 'getItem'> = localStorage): ProgressState {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as ProgressState
    if (!parsed || typeof parsed !== 'object') return emptyState()
    return {
      phrases: parsed.phrases ?? {},
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
    }
  } catch {
    return emptyState()
  }
}

export function saveState(
  state: ProgressState,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}
