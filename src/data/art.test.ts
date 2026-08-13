import { describe, expect, it } from 'vitest'
import { allPhrases } from './topics'
import { phraseArt } from './art'

describe('phrase art', () => {
  it('gives every phrase its own illustration spec', () => {
    for (const phrase of allPhrases) {
      expect(phraseArt[phrase.id], phrase.id).toBeTruthy()
    }
    expect(Object.keys(phraseArt)).toHaveLength(allPhrases.length)
  })
})
