import { afterEach, describe, expect, it, vi } from "vitest";
import { createWebTts } from "./tts";

class FakeUtterance {
  lang = "";
  rate = 1;

  constructor(public text: string) {}
}

function createSpeechFake() {
  return {
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    speak: vi.fn(),
  };
}

describe("createWebTts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported and safely ignores commands without Web Speech", () => {
    const tts = createWebTts();

    expect(tts.supported).toBe(false);
    expect(() => {
      tts.speakText("Hello");
      tts.speakSentence("A sentence.");
      tts.speakChapter(["One.", "Two."]);
      tts.pause();
      tts.resume();
      tts.stop();
    }).not.toThrow();
  });

  it("speaks text with the selected language and playback rate", () => {
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    const speech = createSpeechFake();
    const tts = createWebTts(speech as unknown as SpeechSynthesis);

    tts.setRate(1.25);
    tts.speakText("Xin chào", "vi-VN");

    expect(tts.supported).toBe(true);
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).toHaveBeenCalledOnce();
    expect(speech.speak.mock.calls[0]?.[0]).toMatchObject({
      text: "Xin chào",
      lang: "vi-VN",
      rate: 1.25,
    });
  });

  it("speaks sentences and chapter lines in English", () => {
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    const speech = createSpeechFake();
    const tts = createWebTts(speech as unknown as SpeechSynthesis);

    tts.speakSentence("First sentence.");
    tts.speakChapter(["First line.", " ", "Second line."]);

    expect(speech.cancel).toHaveBeenCalledTimes(2);
    expect(speech.speak).toHaveBeenCalledTimes(3);
    expect(speech.speak.mock.calls.map(([utterance]) => utterance)).toMatchObject([
      { text: "First sentence.", lang: "en-US" },
      { text: "First line.", lang: "en-US" },
      { text: "Second line.", lang: "en-US" },
    ]);
  });

  it("controls active speech playback", () => {
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    const speech = createSpeechFake();
    const tts = createWebTts(speech as unknown as SpeechSynthesis);

    tts.pause();
    tts.resume();
    tts.stop();

    expect(speech.pause).toHaveBeenCalledOnce();
    expect(speech.resume).toHaveBeenCalledOnce();
    expect(speech.cancel).toHaveBeenCalledOnce();
  });
});
