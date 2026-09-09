import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { migrate } from '../src/database/migrate.js';
import { seedContent } from '../src/database/seed.js';
import { transaction, type DatabaseClient } from '../src/database/client.js';
import { content, sampleProfile } from './fixtures.js';

let pg: PGlite;
let db: DatabaseClient;
let versionId: string;
const migrations = [{ name: '001_foundation.sql', sql: await readFile(new URL('../database/migrations/001_foundation.sql', import.meta.url), 'utf8') }];
before(async () => {
  pg = new PGlite();
  await pg.waitReady;
  db = { query: async <T extends Record<string, unknown>>(sql: string, params?: unknown[]) => ({ rows: (await pg.query<T>(sql, params)).rows }), execute: async sql => { await pg.exec(sql); } };
  await migrate(db, migrations);
  versionId = (await seedContent(db, content)).version_id;
});
after(async () => { await pg?.close(); });

async function newSession(userId: string | null = null) {
  const id = randomUUID();
  const hash = id.replaceAll('-', '') + randomUUID().replaceAll('-', '');
  await db.query('INSERT INTO app_private.journey_sessions(id,version_id,character_gender,capability_hash,user_id) VALUES ($1,$2,$3,$4,$5)', [id, versionId, 'woman', hash, userId]);
  return id;
}
async function insertResult(sessionId: string, resultId: string, count = 12, wrongTotal = false) {
  const profile = sampleProfile();
  await db.query(`INSERT INTO app_private.result_profiles(id,session_id,version_id,scoring_version,primary_archetype,secondary_archetype,tertiary_archetype,shadow_archetype,structured_profile)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`, [resultId, sessionId, versionId, content.scoring_version, profile.archetypes.primary.slug, profile.archetypes.secondary.slug, profile.archetypes.tertiary.slug, profile.archetypes.shadow.slug, JSON.stringify({ ...profile, id: resultId })]);
  for (let i = 0; i < count; i++) {
    const a = profile.archetypes.all[i]!;
    await db.query(`INSERT INTO app_private.archetype_results(result_profile_id,version_id,archetype_slug,raw_score,calibrated_score,normalized_percentage,rank) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [resultId, versionId, a.slug, a.raw_score, a.calibrated_score, a.normalized_percentage + (wrongTotal && i === 11 ? 1 : 0), i + 1]);
  }
}

test('migrations and seed execute on PostgreSQL and are idempotent for unchanged content', async () => {
  assert.deepEqual(await migrate(db, migrations), []);
  assert.equal((await seedContent(db, content)).inserted, false);
  const counts = await db.query<{ archetypes: number; scenes: number; choices: number; dimensions: number }>(`SELECT
    (SELECT count(*)::int FROM app_private.archetypes) AS archetypes,
    (SELECT count(*)::int FROM app_private.scenes) AS scenes,
    (SELECT count(*)::int FROM app_private.scene_choices) AS choices,
    (SELECT count(*)::int FROM app_private.psychological_dimensions) AS dimensions`);
  assert.deepEqual(counts.rows[0], { archetypes: 12, scenes: 15, choices: 60, dimensions: 36 });
});
test('migration checksums and released content cannot be silently rewritten', async () => {
  await assert.rejects(migrate(db, [{ ...migrations[0]!, sql: migrations[0]!.sql + '\n-- changed' }]), /Applied migration changed/);
  const changed = structuredClone(content); changed.scenes[0]!.title = 'A rewritten scene';
  await assert.rejects(seedContent(db, changed), /create a new journey version/);
  await assert.rejects(db.query('UPDATE app_private.scenes SET title=$1 WHERE version_id=$2', ['Changed title', versionId]), /immutable/);
  await assert.rejects(db.query('DELETE FROM app_private.choice_score_effects WHERE version_id=$1', [versionId]), /immutable/);
  await assert.rejects(db.query('UPDATE app_private.journey_versions SET released_at=NULL WHERE id=$1', [versionId]), /immutable/);
  await assert.rejects(db.query(`INSERT INTO app_private.psychological_dimensions(version_id,dimension_type,dimension_key,label,description) VALUES ($1,'traits','late_trait','Late trait','Must use a new release')`, [versionId]), /released content/);
});
test('a new release can coexist while cross-version answers and unknown choices are rejected', async () => {
  const next = structuredClone(content); next.journey_version = '1.2';
  const nextVersion = (await seedContent(db, next)).version_id;
  const sessionId = await newSession();
  await assert.rejects(db.query('INSERT INTO app_private.user_answers(session_id,version_id,scene_id,choice_id) VALUES ($1,$2,$3,$4)', [sessionId, nextVersion, 'scene_01', 'scene_01_choice_a']), /foreign key/);
  await assert.rejects(db.query('INSERT INTO app_private.user_answers(session_id,version_id,scene_id,choice_id) VALUES ($1,$2,$3,$4)', [sessionId, versionId, 'scene_01', 'scene_02_choice_a']), /foreign key/);
});
test('accepted answers are unique and immutable', async () => {
  const sessionId = await newSession();
  const params = [sessionId, versionId, 'scene_01', 'scene_01_choice_a'];
  await db.query('INSERT INTO app_private.user_answers(session_id,version_id,scene_id,choice_id) VALUES ($1,$2,$3,$4)', params);
  await assert.rejects(db.query('INSERT INTO app_private.user_answers(session_id,version_id,scene_id,choice_id) VALUES ($1,$2,$3,$4)', params), /unique constraint/);
  await assert.rejects(db.query('UPDATE app_private.user_answers SET choice_id=$1 WHERE session_id=$2', ['scene_01_choice_b', sessionId]), /immutable/);
});
test('answer insertion and cursor update roll back together on failure', async () => {
  const sessionId = await newSession();
  await assert.rejects(transaction(db, async () => {
    await db.query(`INSERT INTO app_private.user_answers(session_id,version_id,scene_id,choice_id) VALUES ($1,$2,'scene_01','scene_01_choice_a')`, [sessionId, versionId]);
    await db.query('UPDATE app_private.journey_sessions SET current_scene=2 WHERE id=$1', [sessionId]);
    throw new Error('Simulated failed commit path');
  }), /Simulated/);
  const answers = await db.query('SELECT * FROM app_private.user_answers WHERE session_id=$1', [sessionId]);
  const sessions = await db.query<{ current_scene: number }>('SELECT current_scene FROM app_private.journey_sessions WHERE id=$1', [sessionId]);
  assert.equal(answers.rows.length, 0);
  assert.equal(sessions.rows[0]!.current_scene, 1);
});
test('deferred constraints reject missing archetypes and incorrect total, atomically', async () => {
  for (const [count, wrongTotal] of [[11, false], [12, true]] as const) {
    const sessionId = await newSession(); const resultId = randomUUID();
    await assert.rejects(transaction(db, () => insertResult(sessionId, resultId, count, wrongTotal)), /twelve archetypes totaling 100/);
    assert.equal((await db.query('SELECT id FROM app_private.result_profiles WHERE id=$1', [resultId])).rows.length, 0);
  }
  const sessionId = await newSession(); const resultId = randomUUID();
  await transaction(db, () => insertResult(sessionId, resultId));
  const totals = await db.query<{ count: number; total: number }>('SELECT count(*)::int AS count,sum(normalized_percentage)::int AS total FROM app_private.archetype_results WHERE result_profile_id=$1', [resultId]);
  assert.deepEqual(totals.rows[0], { count: 12, total: 100 });
  await assert.rejects(db.query(`UPDATE app_private.result_profiles SET structured_profile='{}' WHERE id=$1`, [resultId]), /immutable/);
  await assert.rejects(db.query('DELETE FROM app_private.archetype_results WHERE result_profile_id=$1', [resultId]), /twelve archetypes/);
});
test('private schema is inaccessible to a browser role and private tables use RLS', async () => {
  await db.execute('CREATE ROLE test_browser NOLOGIN');
  const allowed = await db.query<{ allowed: boolean }>(`SELECT has_schema_privilege('test_browser','app_private','USAGE') AS allowed`);
  assert.equal(allowed.rows[0]!.allowed, false);
  const rls = await db.query<{ enabled: boolean }>(`SELECT relrowsecurity AS enabled FROM pg_class WHERE oid='app_private.journey_sessions'::regclass`);
  assert.equal(rls.rows[0]!.enabled, true);
  await db.execute('SET ROLE test_browser');
  try { await assert.rejects(db.query('SELECT * FROM app_private.journey_sessions'), /permission denied/); }
  finally { await db.execute('RESET ROLE'); }
});
test('deletion cascades through personal data and queues remote asset cleanup', async () => {
  const userId = randomUUID();
  await db.query('INSERT INTO app_private.users(id,name) VALUES ($1,$2)', [userId, 'Delete fixture']);
  const sessionId = await newSession(userId); const resultId = randomUUID();
  await db.query(`INSERT INTO app_private.user_answers(session_id,version_id,scene_id,choice_id) VALUES ($1,$2,'scene_01','scene_01_choice_a')`, [sessionId, versionId]);
  await transaction(db, () => insertResult(sessionId, resultId));
  const assetId = randomUUID(); const storageKey = `private/${resultId}/portrait.png`;
  await db.query(`INSERT INTO app_private.generated_assets(id,result_profile_id,kind,storage_key,content_type) VALUES ($1,$2,'character',$3,'image/png')`, [assetId, resultId, storageKey]);
  await db.query(`INSERT INTO app_private.public_shares(id,result_profile_id,token_hash,selected_projection) VALUES ($1,$2,$3,'{"title":"Shared result"}')`, [randomUUID(), resultId, 'b'.repeat(64)]);
  await db.query('DELETE FROM app_private.users WHERE id=$1', [userId]);
  for (const table of ['result_profiles','generated_assets','public_shares']) {
    const key = table === 'result_profiles' ? 'id' : 'result_profile_id';
    assert.equal((await db.query(`SELECT 1 FROM app_private.${table} WHERE ${key}=$1`, [resultId])).rows.length, 0);
  }
  assert.equal((await db.query('SELECT 1 FROM app_private.user_answers WHERE session_id=$1', [sessionId])).rows.length, 0);
  assert.equal((await db.query('SELECT 1 FROM app_private.journey_sessions WHERE id=$1', [sessionId])).rows.length, 0);
  assert.equal((await db.query('SELECT 1 FROM app_private.asset_deletion_outbox WHERE storage_key=$1 AND completed_at IS NULL', [storageKey])).rows.length, 1);
});
test('SQL validates score bounds and dimension membership in unreleased drafts', async () => {
  const draft = randomUUID();
  await db.query(`INSERT INTO app_private.journey_versions(id,journey_id,journey_version,scoring_version,content_hash,content_snapshot) VALUES ($1,$2,'test-draft','1.0',$3,'{}')`, [draft, content.id, 'c'.repeat(64)]);
  await db.query(`INSERT INTO app_private.scenes(version_id,id,act,scene_order,title,narrative) VALUES ($1,'scene_01',1,1,'Draft','Draft narrative')`, [draft]);
  await db.query(`INSERT INTO app_private.scene_choices(version_id,scene_id,id,choice_order,text) VALUES ($1,'scene_01','scene_01_choice_a',1,'Draft choice')`, [draft]);
  await db.query(`INSERT INTO app_private.psychological_dimensions(version_id,dimension_type,dimension_key,label,description) VALUES ($1,'traits','new_trait','New trait','Extensible signal')`, [draft]);
  await assert.rejects(db.query(`INSERT INTO app_private.choice_score_effects VALUES ($1,'scene_01','scene_01_choice_a','traits','new_trait',4)`, [draft]), /check constraint/);
  await assert.rejects(db.query(`INSERT INTO app_private.choice_score_effects VALUES ($1,'scene_01','scene_01_choice_a','traits','unknown',1)`, [draft]), /foreign key/);
  await db.query(`INSERT INTO app_private.choice_score_effects VALUES ($1,'scene_01','scene_01_choice_a','traits','new_trait',-3)`, [draft]);
  const signed = await db.query<{ score: number }>('SELECT score FROM app_private.choice_score_effects WHERE version_id=$1', [draft]);
  assert.equal(signed.rows[0]!.score, -3);
});
