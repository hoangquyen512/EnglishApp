import { useEffect, useState } from 'react'
import { speakEnglish, stopSpeaking } from '../lib/speech'

type SpeakButtonProps = {
  text: string
  label?: string
  large?: boolean
  autoPlay?: boolean
}

export function SpeakButton({
  text,
  label = 'Nghe',
  large = false,
  autoPlay = false,
}: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
    stopSpeaking()
    if (!autoPlay) return
    const timer = window.setTimeout(() => play(), 250)
    return () => {
      window.clearTimeout(timer)
      stopSpeaking()
    }

    function play() {
      setPlaying(true)
      speakEnglish(text, () => setPlaying(false))
    }
  }, [text, autoPlay])

  return (
    <button
      type="button"
      className={large ? 'speak-btn speak-btn-large' : 'speak-btn'}
      onClick={() => {
        if (playing) {
          stopSpeaking()
          setPlaying(false)
          return
        }
        setPlaying(true)
        speakEnglish(text, () => setPlaying(false))
      }}
      aria-label={`${label}: ${text}`}
    >
      <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
      {playing ? 'Đang đọc' : label}
    </button>
  )
}
