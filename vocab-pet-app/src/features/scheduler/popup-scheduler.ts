import { isTauri } from "../../lib/platform";
import { SCHEDULER_CONFIG, UI_STRINGS } from "../../constants/ui-strings";
import { useUiStore } from "../../stores/ui-store";

let intervalId: ReturnType<typeof setInterval> | null = null;
let onTickCallback: (() => void) | null = null;

async function notifyStudyReminder(): Promise<void> {
  if (typeof Notification === "undefined") {
    return;
  }

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    new Notification(UI_STRINGS.app.title, {
      body: UI_STRINGS.tray.studyNow,
    });
  }
}

/** Shows the flashcard UI (popup window on desktop, modal on web/mobile). */
export async function showStudyPopup(): Promise<void> {
  if (isTauri()) {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const {
      isPermissionGranted,
      requestPermission,
      sendNotification,
    } = await import("@tauri-apps/plugin-notification");

    const popup = await WebviewWindow.getByLabel("popup");
    if (popup) {
      await popup.show();
      await popup.setFocus();
      await popup.center();
    }

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
    return;
  }

  useUiStore.getState().openFlashcard();
  await notifyStudyReminder();
}

/** Starts the demo scheduler. Desktop: main window only. Web: always runs. */
export function startPopupScheduler(onTick?: () => void): void {
  if (intervalId) {
    return;
  }

  onTickCallback = onTick ?? null;

  const tick = () => {
    void showStudyPopup().then(() => onTickCallback?.());
  };

  if (isTauri()) {
    void import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      if (getCurrentWindow().label !== "main") {
        return;
      }
      intervalId = setInterval(tick, SCHEDULER_CONFIG.popupIntervalMs);
    });
    return;
  }

  intervalId = setInterval(tick, SCHEDULER_CONFIG.popupIntervalMs);
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

/** Hides the flashcard UI after a study session. */
export async function hidePopupWindow(): Promise<void> {
  if (isTauri()) {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const popup = await WebviewWindow.getByLabel("popup");
    if (popup) {
      await popup.hide();
    }
    return;
  }

  useUiStore.getState().closeFlashcard();
}
