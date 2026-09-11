import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const root = process.cwd();
const temporaryRoot = await mkdtemp(join(tmpdir(), 'questype-v2-d1-'));
const persistPath = join(temporaryRoot, 'state');
const seedPath = join(temporaryRoot, 'seed-v1.sql');
const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');
const environment = {
  ...process.env,
  WRANGLER_LOG_PATH: join(temporaryRoot, 'wrangler.log'),
};

function run(args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [wrangler, ...args], {
      cwd: root,
      env: environment,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += String(chunk)));
    child.stderr.on('data', (chunk) => (stderr += String(chunk)));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolveRun({ stdout, stderr });
      else reject(new Error(`Wrangler exited ${code}\n${stdout}\n${stderr}`));
    });
  });
}

function d1Args(...args) {
  return [
    'd1',
    'execute',
    'questype-db',
    '--local',
    '--config',
    'wrangler.jsonc',
    '--persist-to',
    persistPath,
    ...args,
  ];
}

try {
  await run(d1Args('--file', 'drizzle/0000_tan_dreadnoughts.sql'));
  const legacySnapshot = JSON.stringify({
    journey_version: '1.1',
    scoring_version: '1.1',
  }).replaceAll("'", "''");
  await writeFile(
    seedPath,
    `INSERT INTO web_visitors(owner_hash,created_at) VALUES ('${'a'.repeat(64)}',1000);
INSERT INTO web_releases(id,content_hash,snapshot,created_at) VALUES ('archetype-journey:1.1:1.1','${'b'.repeat(64)}','${legacySnapshot}',1000);
INSERT INTO web_sessions(id,owner_hash,release_id,state_json,revision,status,current_scene,created_at) VALUES ('10000000-0000-4000-8000-000000000001','${'a'.repeat(64)}','archetype-journey:1.1:1.1','{}',0,'completed',16,1000);
INSERT INTO web_answers(session_id,scene_id,choice_id,position,answered_at) VALUES ('10000000-0000-4000-8000-000000000001','scene_01','scene_01_choice_a',1,1100);
INSERT INTO web_results(id,session_id,profile_json,interpretation_json,created_at) VALUES ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','{"legacy":true}','{"copy":"preserved"}',1200);
INSERT INTO web_shares(id,result_id,projection_json,created_at) VALUES ('legacy-share','20000000-0000-4000-8000-000000000001','{"title":"legacy"}',1300);`,
    'utf8',
  );
  await run(d1Args('--file', seedPath));
  await run(d1Args('--file', 'drizzle/0001_multi_journey.sql'));
  await run(d1Args('--file', 'drizzle/0002_signal_evidence.sql'));
  await run(d1Args('--file', 'drizzle/0003_optional_accounts.sql'));
  const verification = await run(
    d1Args(
      '--command',
      `SELECT
        (SELECT COUNT(*) FROM journeys) AS journeys,
        (SELECT COUNT(*) FROM journey_versions) AS versions,
        (SELECT COUNT(*) FROM web_sessions) AS sessions,
        (SELECT COUNT(*) FROM web_sessions WHERE journey_id='journey_unwritten_road' AND journey_version_id=release_id AND updated_at=created_at) AS migrated_sessions,
        (SELECT COUNT(*) FROM web_answers) AS answers,
        (SELECT COUNT(*) FROM web_results) AS results,
        (SELECT COUNT(*) FROM web_shares) AS shares,
        (SELECT COUNT(*) FROM journey_signal_models) AS signal_models,
        (SELECT COUNT(*) FROM result_signal_assessments) AS signal_assessments,
        (SELECT COUNT(*) FROM result_construct_scores) AS construct_scores,
        (SELECT COUNT(*) FROM result_construct_evidence) AS construct_evidence,
        (SELECT COUNT(*) FROM auth_users) AS auth_users,
        (SELECT COUNT(*) FROM auth_sessions) AS auth_sessions,
        (SELECT COUNT(*) FROM result_claims) AS result_claims,
        (SELECT projection_json FROM web_shares WHERE id='legacy-share') AS preserved_projection;
       PRAGMA foreign_key_check;`,
    ),
  );
  const clean = verification.stdout;
  const start = clean.indexOf('[\n');
  assert.ok(start >= 0, clean);
  const results = JSON.parse(clean.slice(start));
  assert.deepEqual(results[0].results[0], {
    journeys: 1,
    versions: 1,
    sessions: 1,
    migrated_sessions: 1,
    answers: 1,
    results: 1,
    shares: 1,
    signal_models: 0,
    signal_assessments: 0,
    construct_scores: 0,
    construct_evidence: 0,
    auth_users: 0,
    auth_sessions: 0,
    result_claims: 0,
    preserved_projection: '{"title":"legacy"}',
  });
  assert.deepEqual(results[1].results, []);
  console.log({
    passed: true,
    fixture: 'populated V1 D1 database',
    journeys: 1,
    versions: 1,
    migrated_sessions: 1,
    historical_results: 1,
    historical_shares: 1,
    historical_signal_assessments: 0,
    foreign_key_errors: 0,
  });
} finally {
  const resolvedTemporaryRoot = resolve(temporaryRoot);
  const resolvedSystemTemp = resolve(tmpdir()) + sep;
  assert.ok(resolvedTemporaryRoot.startsWith(resolvedSystemTemp));
  await rm(resolvedTemporaryRoot, { recursive: true, force: true });
}
