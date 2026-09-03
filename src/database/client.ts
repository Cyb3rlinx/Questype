export interface DatabaseClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  execute(sql: string): Promise<void>;
}
export async function transaction<T>(db: DatabaseClient, work: () => Promise<T>): Promise<T> {
  await db.execute('BEGIN');
  try {
    const result = await work();
    await db.execute('COMMIT');
    return result;
  } catch (error) {
    await db.execute('ROLLBACK');
    throw error;
  }
}
