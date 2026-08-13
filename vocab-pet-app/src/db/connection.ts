import Database from "@tauri-apps/plugin-sql";
import { DB_URL } from "../constants/ui-strings";
import { isTauri } from "../lib/platform";
import { initWebDatabase } from "./web-storage";

let tauriDb: Database | null = null;

/** Prepares the active database backend (SQLite or localStorage). */
export async function initDatabase(): Promise<void> {
  if (isTauri()) {
    tauriDb = await Database.load(DB_URL);
    return;
  }
  initWebDatabase();
}

/** Returns the shared SQLite database connection (Tauri only). */
export async function getDb(): Promise<Database> {
  if (!isTauri()) {
    throw new Error("SQLite is only available in the Tauri desktop app.");
  }
  if (!tauriDb) {
    tauriDb = await Database.load(DB_URL);
  }
  return tauriDb;
}

/** Runs a SELECT query and returns typed rows. */
export async function selectRows<T>(
  query: string,
  bindValues?: unknown[],
): Promise<T[]> {
  const database = await getDb();
  return database.select<T[]>(query, bindValues);
}

/** Runs an INSERT/UPDATE/DELETE query. */
export async function executeQuery(
  query: string,
  bindValues?: unknown[],
): Promise<void> {
  const database = await getDb();
  await database.execute(query, bindValues);
}
