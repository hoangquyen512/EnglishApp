export type HomeQuickAction = "lookup" | "chat" | "story";

/** Right-side home panel: null sidebar selection shows the daily story lesson. */
export function homeRightPanel(activeAction: HomeQuickAction | null): HomeQuickAction {
  return activeAction ?? "story";
}

/** Cycle a carousel index with wrap-around (Home vocab / phrase stubs). */
export function cycleIndex(current: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return ((current + delta) % length + length) % length;
}

const TIMEZONE = "Asia/Ho_Chi_Minh";

/** 12-hour clock for chat bubbles (e.g. "10:21 PM"). */
export function formatCompanionTime(iso: string, timeZone = TIMEZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
}
