export interface TtsService {
  speakText(text: string, lang?: string): void;
  speakSentence(text: string): void;
  speakChapter(texts: string[]): void;
  stop(): void;
  pause(): void;
  resume(): void;
  setRate(rate: number): void;
  supported: boolean;
}

const DEFAULT_LANGUAGE = "en-US";

export function createWebTts(speech?: SpeechSynthesis): TtsService {
  const engine =
    speech ??
    (typeof globalThis !== "undefined" && "speechSynthesis" in globalThis
      ? globalThis.speechSynthesis
      : undefined);
  let rate = 1;

  const createUtterance = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    return utterance;
  };

  const speakLines = (texts: string[], lang: string) => {
    if (!engine || typeof SpeechSynthesisUtterance === "undefined") return;
    const lines = texts.map((text) => text.trim()).filter(Boolean);
    if (lines.length === 0) return;
    engine.cancel();
    for (const text of lines) engine.speak(createUtterance(text, lang));
  };

  return {
    supported: Boolean(engine && typeof SpeechSynthesisUtterance !== "undefined"),
    speakText(text, lang = DEFAULT_LANGUAGE) {
      speakLines([text], lang);
    },
    speakSentence(text) {
      speakLines([text], DEFAULT_LANGUAGE);
    },
    speakChapter(texts) {
      speakLines(texts, DEFAULT_LANGUAGE);
    },
    stop() {
      engine?.cancel();
    },
    pause() {
      engine?.pause();
    },
    resume() {
      engine?.resume();
    },
    setRate(nextRate) {
      if (Number.isFinite(nextRate) && nextRate > 0) rate = nextRate;
    },
  };
}
