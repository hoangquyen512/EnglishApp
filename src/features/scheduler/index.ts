import { DEFAULT_POPUP_INTERVAL_MINUTES } from "../../constants/study";
import { hidePopupWindow, notifyStudyTime, showPopupWindow } from "../../lib/tauri";

export interface SchedulerHandle {
  stop: () => void;
}

export function intervalMsFromMinutes(minutes: number): number {
  const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_POPUP_INTERVAL_MINUTES;
  return Math.round(safe * 60_000);
}

export function startScheduler(input: {
  intervalMinutes: number;
  onTick?: () => void;
}): SchedulerHandle {
  const ms = intervalMsFromMinutes(input.intervalMinutes);
  const timer = window.setInterval(() => {
    input.onTick?.();
    void notifyStudyTime();
    void showPopupWindow();
  }, ms);
  return {
    stop: () => window.clearInterval(timer),
  };
}

export async function openStudyPopup(): Promise<void> {
  await notifyStudyTime();
  await showPopupWindow();
}

export async function dismissStudyPopup(): Promise<void> {
  await hidePopupWindow();
}
