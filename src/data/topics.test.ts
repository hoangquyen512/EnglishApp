import { describe, expect, it } from 'vitest'
import { allPhrases, filterPhrases, searchTopics, topics } from './topics'

describe('topics', () => {
  it('has twelve topics with 1000 unique phrases each', () => {
    expect(topics).toHaveLength(12)
    const ids = allPhrases.map((phrase) => phrase.id)
    expect(ids).toHaveLength(12000)
    expect(new Set(ids).size).toBe(12000)
    for (const topic of topics) {
      expect(topic.phrases).toHaveLength(1000)
      expect(new Set(topic.phrases.map((phrase) => phrase.en)).size).toBe(1000)
    }
  })

  it('keeps the original first eight greetings cards', () => {
    expect(topics[0]?.phrases.slice(0, 8).map((phrase) => phrase.en)).toEqual([
      'Hi, how are you today?',
      'Nice to meet you.',
      'My name is Linh. What is your name?',
      'I am from Vietnam.',
      'Could you say that again, please?',
      'Sorry, I do not speak English very well.',
      'It was nice talking to you.',
      'See you later.',
    ])
  })

  it('does not glue two time words together', () => {
    for (const phrase of allPhrases) {
      expect(phrase.en, phrase.id).not.toMatch(
        /today this|this week today|tomorrow today|today tomorrow/i,
      )
    }
  })

  it('searches by Vietnamese title and English phrase', () => {
    expect(searchTopics('nhà hàng')[0]?.id).toBe('restaurant')
    expect(searchTopics('boarding pass')[0]?.id).toBe('airport')
    expect(searchTopics('')).toHaveLength(12)
    expect(filterPhrases(topics[0].phrases, 'Nice to meet you')[0]?.id).toBe('greet-2')
  })
})
