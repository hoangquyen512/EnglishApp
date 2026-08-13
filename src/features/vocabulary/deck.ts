export function shuffle<T>(items: T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = copy[i];
    const swap = copy[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    copy[i] = swap;
    copy[j] = current;
  }
  return copy;
}

export function nextDeckIndex(current: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return (current + 1) % length;
}

export function previousDeckIndex(current: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return (current - 1 + length) % length;
}
