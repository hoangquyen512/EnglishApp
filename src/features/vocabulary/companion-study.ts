import { shouldAdvanceCard } from "./timer";

export function shouldSpeakOnCard(input: { autoSpeak: boolean; active: boolean }): boolean {
  return input.autoSpeak && input.active;
}

export function shouldTickAdvance(input: {
  active: boolean;
  paused: boolean;
  remainingMs: number;
}): boolean {
  return input.active && !input.paused && shouldAdvanceCard(input.remainingMs);
}
