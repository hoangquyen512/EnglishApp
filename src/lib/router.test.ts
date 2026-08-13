import { describe, expect, it } from 'vitest'
import { parseHash, toHash } from './router'

describe('router', () => {
  it('parses home, review, and saved routes', () => {
    expect(parseHash('#/')).toEqual({ name: 'home' })
    expect(parseHash('#/review')).toEqual({ name: 'review' })
    expect(parseHash('#/saved')).toEqual({ name: 'saved' })
  })

  it('parses topic, phrase, and practice routes', () => {
    expect(parseHash('#/topic/cafe')).toEqual({ name: 'topic', topicId: 'cafe' })
    expect(parseHash('#/topic/cafe/phrase/cafe-1')).toEqual({
      name: 'phrase',
      topicId: 'cafe',
      phraseId: 'cafe-1',
    })
    expect(parseHash('#/topic/cafe/practice/cards')).toEqual({
      name: 'practice',
      topicId: 'cafe',
      mode: 'cards',
    })
    expect(parseHash('#/topic/cafe/practice')).toEqual({
      name: 'practice',
      topicId: 'cafe',
      mode: 'quiz',
    })
  })

  it('round-trips hashes', () => {
    const route = { name: 'practice' as const, topicId: 'hotel', mode: 'quiz' as const }
    expect(parseHash(toHash(route))).toEqual(route)
  })
})
