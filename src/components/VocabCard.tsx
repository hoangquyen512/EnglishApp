import type { CSSProperties } from 'react'
import type { Phrase } from '../types'
import { PhraseArt } from './PhraseArt'
import { SpeakButton } from './SpeakButton'

type VocabCardProps = {
  phrase: Phrase
  accent: string
  autoPlay?: boolean
}

export function VocabCard({ phrase, accent, autoPlay = false }: VocabCardProps) {
  return (
    <article className="vocab-card" style={{ '--accent': accent } as CSSProperties}>
      <div className="vocab-art">
        <PhraseArt phraseId={phrase.id} label={`Hình minh họa: ${phrase.en}`} />
      </div>
      <div className="vocab-body">
        <h1 className="vocab-en">{phrase.en}</h1>
        <p className="ipa vocab-ipa">{phrase.ipa}</p>
        <p className="vi vocab-vi">{phrase.vi}</p>
        <SpeakButton text={phrase.en} large autoPlay={autoPlay} />
      </div>
    </article>
  )
}
