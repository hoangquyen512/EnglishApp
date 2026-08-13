export type TopicId =
  | 'greetings'
  | 'cafe'
  | 'restaurant'
  | 'shopping'
  | 'directions'
  | 'hotel'
  | 'health'
  | 'work'
  | 'family'
  | 'phone'
  | 'airport'
  | 'emergency'

export type Phrase = {
  id: string
  en: string
  vi: string
  ipa: string
  note: string
}

export type Topic = {
  id: TopicId
  titleVi: string
  titleEn: string
  blurb: string
  emoji: string
  accent: string
  phrases: Phrase[]
}

export type PhraseProgress = {
  seen: boolean
  correctStreak: number
  mastered: boolean
  lastReviewedAt: number | null
}

export type ProgressState = {
  phrases: Record<string, PhraseProgress>
  saved: string[]
}

export type Route =
  | { name: 'home' }
  | { name: 'topic'; topicId: string }
  | { name: 'phrase'; topicId: string; phraseId: string }
  | { name: 'practice'; topicId: string; mode: PracticeMode }
  | { name: 'review' }
  | { name: 'saved' }

export type PracticeMode = 'cards' | 'quiz'

export type QuizQuestion = {
  phraseId: string
  promptVi: string
  promptEn: string
  options: string[]
  correctIndex: number
}

export type TopicStats = {
  total: number
  seen: number
  mastered: number
}
