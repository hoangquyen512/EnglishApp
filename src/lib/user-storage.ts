import type { StateStorage } from "zustand/middleware";
import { isTauri } from "./tauri";

const memory = new Map<string, string>();

async function readFile(): Promise<Record<string, string>> {
  if (!isTauri()) {
    return Object.fromEntries(memory);
  }
  const { invoke } = await import("@tauri-apps/api/core");
  const raw = await invoke<string>("read_app_settings");
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    return {};
  }
  return {};
}

async function writeFile(next: Record<string, string>): Promise<void> {
  if (!isTauri()) {
    memory.clear();
    for (const [key, value] of Object.entries(next)) {
      memory.set(key, value);
    }
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("write_app_settings", { contents: JSON.stringify(next, null, 2) });
}

/** Zustand persist adapter that writes `{appDataDir}/settings.json`. */
export const userSettingsStorage: StateStorage = {
  getItem: async (name) => {
    const all = await readFile();
    return all[name] ?? null;
  },
  setItem: async (name, value) => {
    const all = await readFile();
    all[name] = value;
    await writeFile(all);
  },
  removeItem: async (name) => {
    const all = await readFile();
    delete all[name];
    await writeFile(all);
  },
};
