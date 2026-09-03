import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import type { DatabaseClient } from '../src/database/client.js';
import { migrate } from '../src/database/migrate.js';
import { seedContent } from '../src/database/seed.js';
import { journeyV1 } from '../src/domain/content/journey-v1.js';

const action = process.argv[2];
if (!['migrate', 'seed'].includes(action ?? '')) throw new Error('Use database.ts migrate|seed');
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in your shell before running database commands. No database was contacted.');
const client = new Client({ connectionString: process.env.DATABASE_URL });
const db: DatabaseClient = {
  query: async <T extends Record<string, unknown>>(sql: string, params?: unknown[]) => ({ rows: (await client.query<T>(sql, params)).rows }),
  execute: async sql => { await client.query(sql); },
};
try {
  await client.connect();
  if (action === 'migrate') {
    const directory = new URL('../database/migrations/', import.meta.url);
    const files = (await readdir(directory)).filter(name => name.endsWith('.sql')).sort();
    const migrations = await Promise.all(files.map(async name => ({ name, sql: await readFile(fileURLToPath(new URL(name, directory)), 'utf8') })));
    console.log({ applied: await migrate(db, migrations) });
  } else console.log(await seedContent(db, journeyV1));
} finally { await client.end(); }
