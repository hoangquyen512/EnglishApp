import { describe, expect, it } from 'vitest'
import { allPhrases, searchTopics, topics } from './topics'

describe('topics', () => {
  it('has twelve topics with eight unique phrases each', () => {
    expect(topics).toHaveLength(12)
    const ids = allPhrases.map((phrase) => phrase.id)
    expect(ids).toHaveLength(96)
    expect(new Set(ids).size).toBe(96)
    for (const topic of topics) {
      expect(topic.phrases).toHaveLength(8)
    }
  })

  it('searches by Vietnamese title and English phrase', () => {
    expect(searchTopics('nhà hàng')[0]?.id).toBe('restaurant')
    expect(searchTopics('boarding pass')[0]?.id).toBe('airport')
    expect(searchTopics('')).toHaveLength(12)
  })
})
