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

export function progressPercentageFromScroll(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  storedPercentage: number,
): number {
  const available = scrollHeight - clientHeight;
  const computed =
    available <= 0
      ? 100
      : Math.min(100, Math.max(0, Math.round((scrollTop / available) * 100)));
  return Math.max(storedPercentage, computed);
}

export function resumeScrollTop(
  progressPercentage: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const available = Math.max(0, scrollHeight - clientHeight);
  return available * (Math.min(100, Math.max(0, progressPercentage)) / 100);
}

export function chapterCompletedAt(
  progressPercentage: number,
  previousCompletedAt: string | null,
  nowIso: string,
): string | null {
  if (previousCompletedAt) return previousCompletedAt;
  return isChapterNearComplete(progressPercentage) ? nowIso : null;
}
