import { DEFAULT_POPUP_INTERVAL_MINUTES } from "../../constants/study";
import { currentSession } from "../auth";
import { hidePopupWindow, notifyStudyTime, showPopupWindow } from "../../lib/tauri";

export interface SchedulerHandle {
  stop: () => void;
}

export function intervalMsFromMinutes(minutes: number): number {
  const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_POPUP_INTERVAL_MINUTES;
  return Math.round(safe * 60_000);
}

export function canNotify(hasSession: boolean): boolean {
  return hasSession;
}

export function startScheduler(input: {
  intervalMinutes: number;
  onTick?: () => void;
}): SchedulerHandle {
  const ms = intervalMsFromMinutes(input.intervalMinutes);
  const timer = window.setInterval(() => {
    void (async () => {
      const session = await currentSession();
      if (!canNotify(session !== null)) {
        return;
      }
      input.onTick?.();
      await notifyStudyTime();
      await showPopupWindow();
    })();
  }, ms);
  return {
    stop: () => window.clearInterval(timer),
  };
}

export async function openStudyPopup(): Promise<void> {
  const session = await currentSession();
  if (!canNotify(session !== null)) {
    await showPopupWindow();
    return;
  }
  await notifyStudyTime();
  await showPopupWindow();
}

export async function dismissStudyPopup(): Promise<void> {
  await hidePopupWindow();
}
