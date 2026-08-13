import { LLM_TIMEOUT_MS, PET_NAME } from "../constants";
import { createFakeLlm } from "./fake";
import type { CoachChip, LlmClient, LlmTurnInput, LlmTurnResult } from "./types";

function useFake(): boolean {
  if (process.env.LLM_FAKE === "1") return true;
  if (!process.env.LLM_API_KEY) return true;
  return false;
}

export class LlmTimeoutError extends Error {
  constructor() {
    super("LLM timeout");
    this.name = "LlmTimeoutError";
  }
}

export class LlmFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmFailedError";
  }
}

function parseResult(raw: unknown): LlmTurnResult {
  const data = raw as Partial<LlmTurnResult>;
  if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
    throw new LlmFailedError("Companion reply missing");
  }
  const coach = Array.isArray(data.coach)
    ? (data.coach as CoachChip[]).slice(0, 2)
    : [];
  return {
    reply: data.reply.trim(),
    mood: data.mood ?? null,
    coach,
    levelSuggestion: data.levelSuggestion ?? "keep",
    memorySummary: data.memorySummary,
    crisis: Boolean(data.crisis),
  };
}

function createRemoteLlm(): LlmClient {
  const baseUrl = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const apiKey = process.env.LLM_API_KEY ?? "";

  return {
    async complete(input: LlmTurnInput): Promise<LlmTurnResult> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            temperature: 0.7,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: [
                  `You are ${PET_NAME}, a warm, curious English companion in the Yume app.`,
                  "Friend, not teacher. One main question per turn. Short.",
                  `Speak English at ${input.level} level.`,
                  "UI is Vietnamese; your chat bubbles stay English.",
                  "If the user writes Vietnamese, understand them, reply in simple English, and invite them to try English without shame.",
                  "If they express self-harm or crisis: listen, point to real-world help, set crisis=true, attach no coach chips.",
                  "When mood is down, prefer naturaler/vocab chips, not grammar.",
                  "Return JSON: { reply, mood: {mood, moodNote}|null, coach: CoachChip[], levelSuggestion, memorySummary?, crisis }",
                  "CoachChip: { type: naturaler|vocab|grammar, title_vi, suggestion_en, explain_vi, original_en? }",
                  "0-2 coach chips only when there is a clear payoff. mood only when the utterance has a signal.",
                ].join(" "),
              },
              {
                role: "user",
                content: JSON.stringify({
                  purpose: input.purpose,
                  memorySummary: input.memorySummary,
                  recent: input.recent,
                  currentUserMessage: input.currentUserMessage,
                  mood: input.mood,
                  moodNote: input.moodNote,
                }),
              },
            ],
          }),
        });
        if (!res.ok) {
          throw new LlmFailedError(`LLM HTTP ${res.status}`);
        }
        const payload = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = payload.choices?.[0]?.message?.content;
        if (!content) throw new LlmFailedError("Empty LLM content");
        return parseResult(JSON.parse(content));
      } catch (error) {
        if (error instanceof LlmFailedError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new LlmTimeoutError();
        }
        throw new LlmFailedError(error instanceof Error ? error.message : "LLM failed");
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

let override: LlmClient | null = null;

export function setLlmClientForTests(client: LlmClient | null) {
  override = client;
}

export function getLlmClient(): LlmClient {
  if (override) return override;
  if (useFake()) return createFakeLlm();
  return createRemoteLlm();
}
