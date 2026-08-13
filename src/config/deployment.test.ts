import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface TauriConf {
  app: {
    windows: Array<{ label: string; width: number; height: number }>;
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

  it("sizes the study popup for a TOEIC flashcard", () => {
    const popup = loadConf().app.windows.find((window) => window.label === "popup");
    expect(popup?.width).toBe(420);
    expect(popup?.height).toBe(680);
  });
});
