export function speakEnglish(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.()
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.92
  if (onEnd) {
    utterance.onend = onEnd
    utterance.onerror = onEnd
  }

  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
  if (englishVoice) utterance.voice = englishVoice

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}
