export function speakEnglish(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.92

  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
  if (englishVoice) utterance.voice = englishVoice

  window.speechSynthesis.speak(utterance)
}
