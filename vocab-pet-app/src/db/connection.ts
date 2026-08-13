import Database from "@tauri-apps/plugin-sql";
import { DB_URL } from "../constants/ui-strings";

let db: Database | null = null;

/** Returns the shared SQLite database connection. */
export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load(DB_URL);
  }
  return db;
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
