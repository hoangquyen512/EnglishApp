import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { SCHEDULER_CONFIG, UI_STRINGS } from "../../constants/ui-strings";

let intervalId: ReturnType<typeof setInterval> | null = null;
let onTickCallback: (() => void) | null = null;

/** Shows the popup window and optionally sends a notification. */
export async function showStudyPopup(): Promise<void> {
  const popup = await WebviewWindow.getByLabel("popup");
  if (popup) {
    await popup.show();
    await popup.setFocus();
    await popup.center();
  }

  await maybeNotify();
}

/** Sends a desktop notification if permission is granted. */
async function maybeNotify(): Promise<void> {
  let granted = await isPermissionGranted();
  if (!granted) {
    const permission = await requestPermission();
    granted = permission === "granted";
  }

  if (granted) {
    await sendNotification({
      title: UI_STRINGS.app.title,
      body: UI_STRINGS.tray.studyNow,
    });
  }
}

/** Starts the demo scheduler (popup every X minutes). Only runs in the main window. */
export function startPopupScheduler(onTick?: () => void): void {
  if (intervalId) {
    return;
  }

  onTickCallback = onTick ?? null;
  const window = getCurrentWindow();

  if (window.label !== "main") {
    return;
  }

  intervalId = setInterval(async () => {
    await showStudyPopup();
    onTickCallback?.();
  }, SCHEDULER_CONFIG.popupIntervalMs);
}

/** Stops the popup scheduler. */
export function stopPopupScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  onTickCallback = null;
}

/** Returns configured popup interval in milliseconds. */
export function getPopupIntervalMs(): number {
  return SCHEDULER_CONFIG.popupIntervalMs;
}

/** Hides the popup window after a study session. */
export async function hidePopupWindow(): Promise<void> {
  const popup = await WebviewWindow.getByLabel("popup");
  if (popup) {
    await popup.hide();
  }
}
