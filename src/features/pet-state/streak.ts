export function nextStreakOnStudy(
  currentStreak: number,
  previousLastDate: string | null,
  today: string,
  yesterday: string,
): number {
  if (previousLastDate === today) {
    return Math.max(currentStreak, 1);
  }
  if (previousLastDate === yesterday) {
    return Math.max(currentStreak, 0) + 1;
  }
  return 1;
}

export function streakAfterIdle(
  currentStreak: number,
  lastDate: string | null,
  today: string,
  yesterday: string,
): number {
  if (lastDate === today || lastDate === yesterday) {
    return currentStreak;
  }
  return 0;
}
