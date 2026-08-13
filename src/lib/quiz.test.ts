import { describe, expect, it } from 'vitest'
import type { Phrase } from '../types'
import { buildQuizQuestion, nextUnmastered, scorePercent } from './quiz'

const phrases: Phrase[] = [
  { id: '1', en: 'Hello', vi: 'Xin chào', ipa: '', note: '' },
  { id: '2', en: 'Thanks', vi: 'Cảm ơn', ipa: '', note: '' },
  { id: '3', en: 'Please', vi: 'Làm ơn', ipa: '', note: '' },
  { id: '4', en: 'Sorry', vi: 'Xin lỗi', ipa: '', note: '' },
]

describe('quiz', () => {
  it('builds a question with the correct English option', () => {
    const question = buildQuizQuestion(phrases[0], phrases, () => 0)
    expect(question.promptVi).toBe('Xin chào')
    expect(question.options).toHaveLength(4)
    expect(question.options[question.correctIndex]).toBe('Hello')
    expect(new Set(question.options).size).toBe(4)
  })

  it('skips mastered phrases when picking the next one', () => {
    const next = nextUnmastered(phrases, new Set(['1', '2']), '2')
    expect(next?.id).toBe('3')
  })

  it('wraps around the phrase list', () => {
    const next = nextUnmastered(phrases, new Set(['4']), '4')
    expect(next?.id).toBe('1')
  })

  it('scores a round as a percent', () => {
    expect(scorePercent(3, 4)).toBe(75)
    expect(scorePercent(0, 0)).toBe(0)
  })
})
