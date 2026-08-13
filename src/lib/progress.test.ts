import { describe, expect, it } from 'vitest'
import type { Topic } from '../types'
import {
  emptyState,
  markAnswer,
  markSeen,
  overallStats,
  reviewPhraseIds,
  toggleSaved,
  topicStats,
} from './progress'

const topic: Topic = {
  id: 'greetings',
  titleVi: 'Chào hỏi',
  titleEn: 'Greetings',
  blurb: '',
  emoji: '👋',
  accent: '#000',
  phrases: [
    {
      id: 'a',
      en: 'Hello',
      vi: 'Xin chào',
      ipa: '/həˈləʊ/',
      note: '',
    },
    {
      id: 'b',
      en: 'Bye',
      vi: 'Tạm biệt',
      ipa: '/baɪ/',
      note: '',
    },
  ],
}

describe('progress', () => {
  it('marks a phrase as seen without mastering it', () => {
    const next = markSeen(emptyState(), 'a')
    expect(next.phrases.a.seen).toBe(true)
    expect(next.phrases.a.mastered).toBe(false)
  })

  it('masters a phrase after two correct answers', () => {
    const once = markAnswer(emptyState(), 'a', true)
    expect(once.phrases.a.mastered).toBe(false)
    const twice = markAnswer(once, 'a', true)
    expect(twice.phrases.a.mastered).toBe(true)
    expect(twice.phrases.a.correctStreak).toBe(2)
  })

  it('resets the streak after a wrong answer', () => {
    const once = markAnswer(emptyState(), 'a', true)
    const wrong = markAnswer(once, 'a', false)
    expect(wrong.phrases.a.correctStreak).toBe(0)
    expect(wrong.phrases.a.mastered).toBe(false)
  })

  it('toggles saved phrases', () => {
    const saved = toggleSaved(emptyState(), 'a')
    expect(saved.saved).toEqual(['a'])
    const unsaved = toggleSaved(saved, 'a')
    expect(unsaved.saved).toEqual([])
  })

  it('computes topic and overall stats', () => {
    let state = markSeen(emptyState(), 'a')
    state = markAnswer(state, 'a', true)
    state = markAnswer(state, 'a', true)
    expect(topicStats(state, topic)).toEqual({ total: 2, seen: 1, mastered: 1 })
    expect(overallStats(state, [topic])).toEqual({ total: 2, seen: 1, mastered: 1 })
  })

  it('lists seen but unmastered phrases for review', () => {
    let state = markSeen(emptyState(), 'a')
    state = markAnswer(state, 'b', true)
    expect(reviewPhraseIds(state, [topic])).toEqual(['a', 'b'])
    state = markAnswer(state, 'b', true)
    expect(reviewPhraseIds(state, [topic])).toEqual(['a'])
  })
})
