import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { renderReportPdf } from '../lib/pdf-renderer.js';
import type { ReportData } from '../src/reports/data.js';
const base = process.env.TEST_APP_URL ?? 'http://localhost:3000';
let cookie = '';
async function call(
  path: string,
  method = 'GET',
  body?: unknown,
  overrides: Record<string, string> = {},
) {
  const r = await fetch(base + path, {
    method,
    headers: {
      Origin: base,
      Cookie: cookie,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...overrides,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const c = r.headers.get('set-cookie');
  if (c) cookie = c.split(';')[0]!;
  const contentType = r.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? ((await r.json()) as any)
    : await r.text();
  return { status: r.status, data, headers: r.headers };
}
assert.equal((await call('/api/session')).status, 404);
assert.equal(
  (
    await call(
      '/api/session',
      'POST',
      {
        name: 'QA traveler',
        character_gender: 'woman',
        request_id: randomUUID(),
      },
      { Origin: 'https://not-this-site.example' },
    )
  ).status,
  403,
);
const started = await call('/api/session', 'POST', {
  name: 'QA traveler',
  character_gender: 'woman',
  request_id: randomUUID(),
});
assert.equal(started.status, 200, JSON.stringify(started.data));
assert.ok(started.headers.get('set-cookie')?.includes('HttpOnly'));
let session = started.data;
assert.ok(!JSON.stringify(session).includes('scores'));
const id = session.id;
const raced = await Promise.all(
  session.scene.choices
    .slice(0, 2)
    .map((c: any) =>
      call('/api/session/answer', 'POST', {
        session_id: id,
        scene_id: session.scene.id,
        choice_id: c.id,
      }),
    ),
);
assert.deepEqual(raced.map((r) => r.status).sort(), [200, 409]);
session = (await call('/api/session')).data;
assert.equal(session.completed_scenes, 1);
for (let i = 1; i < 15; i++) {
  const previous = JSON.stringify(session);
  const chosen = session.scene.choices[i % 4];
  const response = await call('/api/session/answer', 'POST', {
    session_id: id,
    scene_id: session.scene.id,
    choice_id: chosen.id,
  });
  assert.equal(response.status, 200, JSON.stringify(response.data));
  session = response.data;
  if (i === 7) {
    const resumed = (await call('/api/session')).data;
    assert.equal(resumed.current_scene, 9);
    assert.equal(resumed.completed_scenes, 8);
  }
  if (i === 4) {
    const prior = JSON.parse(previous);
    assert.equal(
      (
        await call('/api/session/answer', 'POST', {
          session_id: id,
          scene_id: prior.scene.id,
          choice_id: chosen.id,
        })
      ).status,
      200,
    );
  }
}
assert.equal(session.status, 'processing');
const complete = await call('/api/session/complete', 'POST', {
  session_id: id,
});
assert.equal(complete.status, 200, JSON.stringify(complete.data));
const resultId = complete.data.result_id;
assert.equal(
  (await call('/api/session/complete', 'POST', { session_id: id })).data
    .result_id,
  resultId,
);
const result = await call(`/api/results/${resultId}`);
assert.equal(result.status, 200);
assert.equal(
  result.data.profile.archetypes.all.reduce(
    (n: number, a: any) => n + a.normalized_percentage,
    0,
  ),
  100,
);
assert.equal(
  (await call(`/api/results/${resultId}`, 'GET', undefined, { Cookie: '' }))
    .status,
  404,
);
const report = (await call(`/api/results/${resultId}/report`))
  .data as ReportData;
const pdf = await renderReportPdf(report, {
  bodyFont: new Uint8Array(await readFile('public/fonts/body.woff')),
  headingFont: new Uint8Array(await readFile('public/fonts/heading.woff')),
  landscape: new Uint8Array(await readFile('public/images/valley-wide.png')),
});
await mkdir('artifacts/browser-qa', { recursive: true });
await writeFile('artifacts/browser-qa/sample-journey-report.pdf', pdf);
const shared = await call(`/api/results/${resultId}/share`, 'POST', {
  include_name: false,
  top_count: 2,
});
assert.equal(shared.status, 200);
const restoredShare = await call(`/api/results/${resultId}/share`);
assert.equal(restoredShare.data.url, shared.data.url);
assert.equal(restoredShare.data.top_count, 2);
assert.equal(restoredShare.data.include_name, false);
assert.equal(
  (
    await call(`/api/results/${resultId}/share`, 'GET', undefined, {
      Cookie: '',
    })
  ).status,
  404,
);
const sharePath = new URL(shared.data.url).pathname;
const publicPage = await call(sharePath, 'GET', undefined, { Cookie: '' });
assert.equal(publicPage.status, 200);
assert.ok(!publicPage.data.includes('QA traveler'));
assert.ok(!publicPage.data.includes('scene_01_choice'));
assert.equal(
  (await call(`/api/results/${resultId}/share`, 'DELETE')).status,
  200,
);
const revoked = await call(sharePath, 'GET', undefined, { Cookie: '' });
assert.equal(revoked.status, 404);
const newJourney = await call('/api/session', 'POST', {
  name: 'Second QA story',
  character_gender: 'man',
  request_id: randomUUID(),
  restart: true,
});
assert.equal(newJourney.status, 200);
assert.notEqual(newJourney.data.id, id);
assert.equal((await call(`/api/results/${resultId}`)).status, 200);
assert.equal((await call('/api/session', 'DELETE')).status, 200);
assert.equal((await call(`/api/results/${resultId}`)).status, 404);
const summary = {
  passed: true,
  checks: [
    'anonymous start',
    'same-origin protection',
    'HttpOnly ownership cookie',
    'no client score maps',
    'concurrent conflicting choices',
    'idempotent answer retry',
    'resume after scene 8',
    '15-scene completion',
    'idempotent result generation',
    'exact score total',
    'private result ownership',
    'PDF export',
    'selected-field share',
    'share revocation',
    'retake preserves earlier result',
    'deletion',
  ],
  pdf_pages: 'inspect sample-journey-report.pdf',
  sample_result: result.data.profile.character.title,
};
await writeFile(
  'artifacts/browser-qa/web-smoke.json',
  JSON.stringify(summary, null, 2),
);
console.log(summary);
