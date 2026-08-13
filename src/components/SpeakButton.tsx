import { speakEnglish } from '../lib/speech'

type SpeakButtonProps = {
  text: string
  label?: string
  large?: boolean
}

export function SpeakButton({ text, label = 'Nghe', large = false }: SpeakButtonProps) {
  return (
    <button
      type="button"
      className={large ? 'speak-btn speak-btn-large' : 'speak-btn'}
      onClick={() => speakEnglish(text)}
      aria-label={`${label}: ${text}`}
    >
      <span aria-hidden="true">▶</span>
      {label}
    </button>
  )
}
