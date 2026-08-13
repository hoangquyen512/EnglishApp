import { isTauri } from "./tauri";

export const DB_FILENAME = "vocab_pet.db";
export const SETTINGS_FILENAME = "settings.json";

export interface UserDataPaths {
  localDataDir: string;
  appDataDir: string;
  configDir: string;
  sqliteUrl: string;
  settingsPath: string;
}

/**
 * Resolves user-scoped dirs through Tauri's path API.
 * These never point at Program Files, /Applications, or the .app/.exe folder.
 */
export async function resolveUserDataDirs(): Promise<{
  localDataDir: string;
  appDataDir: string;
  configDir: string;
}> {
  if (!isTauri()) {
    return { localDataDir: "", appDataDir: "", configDir: "" };
  }
  const { appLocalDataDir, appDataDir, appConfigDir } = await import("@tauri-apps/api/path");
  const [localDataDir, dataDir, configDir] = await Promise.all([
    appLocalDataDir(),
    appDataDir(),
    appConfigDir(),
  ]);
  return { localDataDir, appDataDir: dataDir, configDir };
}

export async function getUserDataPaths(): Promise<UserDataPaths> {
  if (!isTauri()) {
    return {
      localDataDir: "",
      appDataDir: "",
      configDir: "",
      sqliteUrl: `sqlite:${DB_FILENAME}`,
      settingsPath: SETTINGS_FILENAME,
    };
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<UserDataPaths>("user_data_paths");
}
