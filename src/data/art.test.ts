import { describe, expect, it } from 'vitest'
import { allPhrases } from './topics'
import { phraseArt } from './art'

describe('phrase art', () => {
  it('gives every phrase a visual caption and emoji', () => {
    for (const phrase of allPhrases) {
      const art = phraseArt[phrase.id]
      expect(art, phrase.id).toBeTruthy()
      expect(art.emoji.length).toBeGreaterThan(0)
      expect(art.caption.length).toBeGreaterThan(2)
    }
    expect(Object.keys(phraseArt)).toHaveLength(allPhrases.length)
  })
})
