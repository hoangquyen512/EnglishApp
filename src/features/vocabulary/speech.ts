export interface TtsConfig {
  text: string;
  lang: "en-US";
  rate: number;
  pitch: number;
}

export function ttsConfig(text: string): TtsConfig {
  return {
    text,
    lang: "en-US",
    rate: 0.9,
    pitch: 1,
  };
}

export function speakWord(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  const config = ttsConfig(text);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(config.text);
  utterance.lang = config.lang;
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  const voice = window.speechSynthesis
    .getVoices()
    .find((item) => item.lang.toLowerCase().startsWith("en"));
  if (voice) {
    utterance.voice = voice;
  }
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}
