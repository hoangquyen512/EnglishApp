import Database from "@tauri-apps/plugin-sql";

export const DB_URL = "sqlite:vocab_pet.db";

let instance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!instance) {
    instance = await Database.load(DB_URL);
  }
  return instance;
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
