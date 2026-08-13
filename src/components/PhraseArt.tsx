type PhraseArtProps = {
  phraseId: string
  label: string
}

export function PhraseArt({ phraseId, label }: PhraseArtProps) {
  return (
    <img
      className="phrase-art"
      src={`/illustrations/${phraseId}.jpg`}
      alt={label}
      width={640}
      height={640}
    />
  )
}
