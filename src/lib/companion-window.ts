import {
  COMPANION_COLLAPSED_SIZE,
  COMPANION_EXPANDED_SIZE,
  companionBounds,
} from "../features/companion/window-geometry";
import { isTauri } from "./tauri";

export async function setCompanionWindowBounds(expanded: boolean): Promise<void> {
  if (!isTauri()) {
    try {
      const size = expanded ? COMPANION_EXPANDED_SIZE : COMPANION_COLLAPSED_SIZE;
      window.resizeTo(size.width, size.height);
    } catch {
      // Browsers may ignore resizeTo; CSS layout still works.
    }
    return;
  }

  const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
  const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/dpi");
  const win = getCurrentWebviewWindow();
  const factor = await win.scaleFactor();
  const position = (await win.outerPosition()).toLogical(factor);
  const outer = (await win.outerSize()).toLogical(factor);
  const next = companionBounds({
    expanded,
    x: position.x,
    y: position.y,
    width: outer.width,
    height: outer.height,
  });
  await win.setSize(new LogicalSize(next.width, next.height));
  await win.setPosition(new LogicalPosition(next.x, next.y));
}
