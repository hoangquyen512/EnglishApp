import { APP_NAME } from "../constants/ui";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function getWindowLabel(): Promise<"main" | "popup"> {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("window");
  if (fromQuery === "popup" || fromQuery === "main") {
    return fromQuery;
  }
  if (window.location.hash.includes("popup")) {
    return "popup";
  }
  if (!isTauri()) {
    return "main";
  }
  const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
  const label = getCurrentWebviewWindow().label;
  return label === "popup" ? "popup" : "main";
}

export async function showMainWindow(): Promise<void> {
  if (!isTauri()) {
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("show_main_window");
}

export async function showPopupWindow(): Promise<void> {
  if (!isTauri()) {
    const popup = new URL(window.location.href);
    popup.searchParams.set("window", "popup");
    window.open(popup.toString(), "yume-popup", "width=120,height=120");
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("show_popup_window");
}

export async function hidePopupWindow(): Promise<void> {
  if (!isTauri()) {
    window.close();
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("hide_popup_window");
}

export async function notifyStudyTime(): Promise<void> {
  if (!isTauri()) {
    return;
  }
  const {
    isPermissionGranted,
    requestPermission,
    sendNotification,
  } = await import("@tauri-apps/plugin-notification");
  let granted = await isPermissionGranted();
  if (!granted) {
    granted = (await requestPermission()) === "granted";
  }
  if (granted) {
    sendNotification({
      title: APP_NAME,
      body: "Một thẻ TOEIC nhỏ cho pet?",
    });
  }
}
