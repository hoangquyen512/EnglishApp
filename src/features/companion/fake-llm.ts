import type { Mood } from "./constants";
import { PET_NAME } from "./constants";
import { composeLocalReply } from "./compose-reply";
import type { LlmClient, LlmTurnInput, LlmTurnResult } from "./llm-types";

const CRISIS = /\b(kill myself|suicide|end my life|want to die|tự tử|muốn chết)\b/i;
const DOWN = /\b(exhausted|tired|sad|lonely|heavy|depressed|mệt|buồn)\b/i;
const UP = /\b(excited|happy|got the job|great|wonderful|vui|tuyệt)\b/i;
const OK = /\b(okay|ok|nothing much|fine|bình thường)\b/i;

function moodFromText(text: string): { mood: Mood; moodNote: string } | null {
  if (DOWN.test(text)) return { mood: "down", moodNote: "sounded tired or heavy" };
  if (UP.test(text)) return { mood: "up", moodNote: "sounded happy" };
  if (OK.test(text)) return { mood: "ok", moodNote: "nothing special" };
  return null;
}

function coachFor(text: string) {
  if (/\bI sleep\b/i.test(text) && /\b(better|last night|yesterday)\b/i.test(text)) {
    return [
      {
        type: "naturaler" as const,
        title_vi: "Cách nói tự nhiên hơn",
        original_en: "I sleep a little better.",
        suggestion_en: "I slept a little better.",
        explain_vi: "Chuyện đã xảy ra — dùng slept (quá khứ), không phải sleep.",
      },
    ];
  }
  if (/\bI go to work yesterday\b/i.test(text)) {
    return [
      {
        type: "grammar" as const,
        title_vi: "Ngữ pháp",
        original_en: "I go to work yesterday",
        suggestion_en: "I went to work yesterday.",
        explain_vi: "Có yesterday thì động từ lùi về quá khứ: went.",
      },
    ];
  }
  return [];
}

export function createFakeLlm(): LlmClient {
  return {
    async complete(input: LlmTurnInput): Promise<LlmTurnResult> {
      if (input.purpose === "checkin") {
        const note = input.moodNote;
        const reply = note
          ? `Hey, yesterday sounded like this: ${note}. How are you now?`
          : `Hey, how is your day going?`;
        return { reply, mood: null, coach: [], levelSuggestion: "keep", crisis: false };
      }

      const crisis = CRISIS.test(input.currentUserMessage);
      if (crisis) {
        return {
          reply:
            "I'm really glad you told me. Please talk to someone near you, or a local helpline. I can stay here, but a real person should be with you.",
          mood: { mood: "down", moodNote: "needs real-world support" },
          coach: [],
          levelSuggestion: "keep",
          crisis: true,
        };
      }

      const vietnamese = /[ăâêôơưđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i.test(input.currentUserMessage);
      const lastCompanionReply = [...input.recent]
        .reverse()
        .find((item) => item.role === "companion")?.body;
      const reply = vietnamese
        ? "I hear you. Want to try that in English? I can help."
        : composeLocalReply({ text: input.currentUserMessage, lastCompanionReply });

      return {
        reply,
        mood: moodFromText(input.currentUserMessage),
        coach: coachFor(input.currentUserMessage),
        levelSuggestion: "keep",
        memorySummary: input.memorySummary
          ? `${input.memorySummary} Recently: ${input.currentUserMessage.slice(0, 80)}`
          : input.currentUserMessage.slice(0, 200),
        crisis: false,
      };
    },
  };
}

export const defaultFakeReplyName = PET_NAME;
