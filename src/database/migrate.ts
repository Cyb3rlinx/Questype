import { createHash } from 'node:crypto';
import { transaction, type DatabaseClient } from './client.js';

export interface Migration { name: string; sql: string }
export async function migrate(db: DatabaseClient, migrations: readonly Migration[]): Promise<string[]> {
  return transaction(db, async () => {
    await db.query('SELECT pg_advisory_xact_lock($1)', [12981731]);
    await db.execute(`CREATE SCHEMA IF NOT EXISTS app_private;
      REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
      CREATE TABLE IF NOT EXISTS app_private.schema_migrations (
        name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
      ); REVOKE ALL ON app_private.schema_migrations FROM PUBLIC;`);
    const existing = await db.query<{ name: string; checksum: string }>('SELECT name,checksum FROM app_private.schema_migrations ORDER BY name');
    const sorted = [...migrations].sort((a, b) => a.name.localeCompare(b.name));
    if (new Set(sorted.map(m => m.name)).size !== sorted.length) throw new Error('Duplicate migration name');
    for (let i = 0; i < existing.rows.length; i++) if (existing.rows[i]!.name !== sorted[i]?.name) throw new Error('Migration history is not a prefix of supplied migrations');
    const applied: string[] = [];
    for (const migration of sorted) {
      const checksum = createHash('sha256').update(migration.sql).digest('hex');
      const prior = existing.rows.find(row => row.name === migration.name);
      if (prior) {
        if (prior.checksum !== checksum) throw new Error(`Applied migration changed: ${migration.name}`);
        continue;
      }
      await db.execute(migration.sql);
      await db.query('INSERT INTO app_private.schema_migrations(name,checksum) VALUES ($1,$2)', [migration.name, checksum]);
      applied.push(migration.name);
    }
    return applied;
  });
}
