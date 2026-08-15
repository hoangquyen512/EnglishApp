import { isTauri } from "./tauri";

/** Check GitHub nightly release and install when a newer version exists. */
export async function checkAndInstallDesktopUpdate(): Promise<void> {
  if (!isTauri()) {
    return;
  }
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    if (!update) {
      return;
    }
    const ok = window.confirm(
      `Có bản Yume mới (${update.version}). Cài ngay?\n\n${update.body ?? ""}`.trim(),
    );
    if (!ok) {
      return;
    }
    await update.downloadAndInstall();
    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();
  } catch (error) {
    console.warn("desktop update check skipped", error);
  }
}
