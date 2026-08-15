import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { APP_NAME, DEFAULT_PET_NAME } from "../constants/ui";

interface TauriConf {
  productName: string;
  identifier: string;
  app: {
    windows: Array<{
      label: string;
      title: string;
      width: number;
      height: number;
      transparent?: boolean;
      alwaysOnTop?: boolean;
      decorations?: boolean;
      skipTaskbar?: boolean;
    }>;
  };
  bundle: {
    targets: string | string[];
    windows?: { nsis?: { installMode?: string } };
  };
}

function loadConf(): TauriConf {
  return JSON.parse(readFileSync(resolve("src-tauri/tauri.conf.json"), "utf8")) as TauriConf;
}

describe("deployment constraints", () => {
  it("installs per-user on Windows and ships a relocatable macOS DMG", () => {
    const conf = loadConf();
    const targets = conf.bundle.targets;

    expect(Array.isArray(targets)).toBe(true);
    if (!Array.isArray(targets)) {
      return;
    }

    expect(targets).toContain("nsis");
    expect(targets).toContain("dmg");
    expect(targets).toContain("app");
    expect(targets).not.toContain("msi");
    expect(targets).not.toContain("pkg");
    expect(targets).not.toBe("all");

    expect(conf.bundle.windows?.nsis?.installMode).toBe("currentUser");
  });

  it("configures the companion popup as a small transparent always-on-top window", () => {
    const popup = loadConf().app.windows.find((window) => window.label === "popup");
    expect(popup?.width).toBe(120);
    expect(popup?.height).toBe(120);
    expect(popup?.transparent).toBe(true);
    expect(popup?.alwaysOnTop).toBe(true);
    expect(popup?.decorations).toBe(false);
    expect(popup?.skipTaskbar).toBe(true);
  });

  it("uses the official Yume product name and bundle identifier", () => {
    const conf = loadConf();
    expect(APP_NAME).toBe("Yume");
    expect(DEFAULT_PET_NAME).toBe("Sora");
    expect(conf.productName).toBe(APP_NAME);
    expect(conf.identifier).toBe("com.hoangquyen.yume");
    expect(conf.app.windows.find((window) => window.label === "main")?.title).toBe(APP_NAME);
    expect(conf.app.windows.find((window) => window.label === "popup")?.title).toBe(APP_NAME);

    const petStateSql = readFileSync(resolve("src-tauri/migrations/003_pet_state.sql"), "utf8");
    expect(petStateSql).toContain(`pet_name TEXT DEFAULT '${DEFAULT_PET_NAME}'`);
  });
});
