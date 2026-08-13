import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./constants";

const hits = new Map<string, number[]>();

export function takeSendSlot(userId: string, now = Date.now()): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (hits.get(userId) ?? []).filter((t) => t > windowStart);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(userId, recent);
    return false;
  }
  recent.push(now);
  hits.set(userId, recent);
  return true;
}

export function resetRateLimitForTests() {
  hits.clear();
}
