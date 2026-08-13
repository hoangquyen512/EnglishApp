import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { illustrationSrc } from '../lib/illustration'
import { topics } from './topics'

const prefixes = [
  'greet',
  'cafe',
  'rest',
  'shop',
  'dir',
  'hotel',
  'health',
  'work',
  'fam',
  'phone',
  'air',
  'emg',
]

describe('phrase art', () => {
  it('has eight picture-dictionary images for each topic prefix', () => {
    for (const prefix of prefixes) {
      for (let slot = 1; slot <= 8; slot += 1) {
        expect(existsSync(`public/illustrations/${prefix}-${slot}.jpg`), `${prefix}-${slot}`).toBe(
          true,
        )
      }
    }
  })

  it('maps every phrase onto one of the eight topic pictures', () => {
    for (const topic of topics) {
      for (const phrase of topic.phrases) {
        const src = illustrationSrc(phrase.id)
        expect(src).toMatch(/^\/illustrations\/[a-z]+-[1-8]\.jpg$/)
        expect(existsSync(`public${src}`), `${phrase.id} -> ${src}`).toBe(true)
      }
    }
  })
})
