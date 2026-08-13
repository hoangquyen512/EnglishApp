import Database from "@tauri-apps/plugin-sql";
import { isTauri } from "../lib/tauri";

export const DB_FILENAME = "vocab_pet.db";

let instance: Database | null = null;
let loading: Promise<Database> | null = null;

async function resolveSqliteUrl(): Promise<string> {
  if (!isTauri()) {
    return `sqlite:${DB_FILENAME}`;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string>("sqlite_db_url");
}

export async function getDb(): Promise<Database> {
  if (instance) {
    return instance;
  }
  if (!loading) {
    loading = (async () => {
      const url = await resolveSqliteUrl();
      const db = await Database.load(url);
      instance = db;
      return db;
    })();
  }
  return loading;
}

export type SqlValue = string | number | null;

export async function select<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const db = await getDb();
  return db.select<T[]>(sql, params);
}

export async function execute(
  sql: string,
  params: SqlValue[] = [],
): Promise<{ rowsAffected: number; lastInsertId: number }> {
  const db = await getDb();
  const result = await db.execute(sql, params);
  return {
    rowsAffected: result.rowsAffected,
    lastInsertId: result.lastInsertId ?? 0,
  };
}

export async function selectOne<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
  const rows = await select<T>(sql, params);
  return rows[0] ?? null;
}
