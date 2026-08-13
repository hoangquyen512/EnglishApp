import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { allPhrases } from './topics'
import { phraseArt } from './art'

describe('phrase art', () => {
  it('gives every phrase a picture-dictionary illustration', () => {
    for (const phrase of allPhrases) {
      const art = phraseArt[phrase.id]
      expect(art, phrase.id).toBeTruthy()
      expect(existsSync(`public/illustrations/${phrase.id}.jpg`), phrase.id).toBe(true)
    }
    expect(Object.keys(phraseArt)).toHaveLength(allPhrases.length)
  })
})
