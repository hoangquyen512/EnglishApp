export const CARD_INTERVAL_MS = 10_000;

export function cardRemainingMs(input: {
  startedAt: number;
  now: number;
  pausedMs: number;
  pausedAt: number | null;
  durationMs?: number;
}): number {
  const duration = input.durationMs ?? CARD_INTERVAL_MS;
  const end = input.pausedAt ?? input.now;
  const elapsed = Math.max(0, end - input.startedAt - input.pausedMs);
  return Math.max(0, duration - elapsed);
}

export function shouldAdvanceCard(remainingMs: number): boolean {
  return remainingMs <= 0;
}

export function cardProgress(remainingMs: number, durationMs = CARD_INTERVAL_MS): number {
  if (durationMs <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0, 1 - remainingMs / durationMs));
}
