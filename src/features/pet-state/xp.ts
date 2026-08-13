import { XP_PER_LEVEL } from "../../constants/pet";

export interface XpSnapshot {
  level: number;
  xp: number;
}

export function applyXpGain(current: XpSnapshot, gained: number): XpSnapshot & { leveledUp: boolean } {
  let { level, xp } = current;
  let remaining = gained;
  let leveledUp = false;
  xp += remaining;
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    level += 1;
    leveledUp = true;
  }
  return { level, xp, leveledUp };
}

export function xpProgressPercent(xp: number): number {
  return Math.max(0, Math.min(100, Math.round((xp / XP_PER_LEVEL) * 100)));
}
