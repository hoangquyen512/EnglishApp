export function storyProgressRatio(
  completedChapters: number,
  currentChapterFraction: number,
  totalChapters: number,
): number {
  if (totalChapters <= 0) return 0;
  const frac = Math.min(1, Math.max(0, currentChapterFraction));
  return (completedChapters + frac) / totalChapters;
}

export function storyProgressLabel(completedChapters: number, totalChapters: number) {
  const read = Math.max(0, Math.floor(completedChapters));
  const total = Math.max(0, totalChapters);
  return { read, total, labelFraction: `${read}/${total}` };
}

export function isChapterNearComplete(progressPercentage: number): boolean {
  return progressPercentage >= 90;
}
