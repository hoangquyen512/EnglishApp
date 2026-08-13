import { isTauri as tauriIsTauri } from "@tauri-apps/api/core";

/** True when running inside the Tauri desktop shell. */
export function isTauri(): boolean {
  return tauriIsTauri();
}

/** True when running in a mobile browser (web mode). */
export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** Active runtime: desktop native shell or browser/PWA. */
export function getRuntime(): "tauri" | "web" {
  return isTauri() ? "tauri" : "web";
}
