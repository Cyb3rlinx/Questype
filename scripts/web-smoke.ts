import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { renderReportPdf } from '../lib/pdf-renderer.js';
import { renderProfileReportPdf } from '../lib/profile-pdf-renderer.js';
import type { ReportData } from '../src/reports/data.js';
import type { ProfileReportData } from '../src/profile/report.js';
const base = process.env.TEST_APP_URL ?? 'http://localhost:3000';
const cookieJar = new Map<string, string>();
function storedCookies() {
  return [...cookieJar].map(([name, value]) => `${name}=${value}`).join('; ');
}
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
      Cookie: storedCookies(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...overrides,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const c = r.headers.get('set-cookie');
  if (c) {
    const pair = c.split(';')[0]!;
    const separator = pair.indexOf('=');
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    if (c.toLowerCase().includes('max-age=0')) cookieJar.delete(name);
    else cookieJar.set(name, value);
  }
  const contentType = r.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? ((await r.json()) as any)
    : await r.text();
  return { status: r.status, data, headers: r.headers, url: r.url };
}
const legacyStart = await call('/start?new=1');
assert.equal(legacyStart.status, 200);
assert.ok(
  legacyStart.url.endsWith('/journey/the-unwritten-road/start?new=1'),
  legacyStart.url,
);
assert.equal((await call('/journeys')).status, 200);
assert.equal((await call('/journey/not-a-real-journey/start')).status, 404);
assert.equal(
  (await call('/api/session?journey_slug=not-a-real-journey')).status,
  404,
);
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
assert.equal(session.journey.slug, 'the-unwritten-road');
assert.equal(session.journey.version, '1.1');
assert.equal(session.total_scenes, 15);
assert.ok(session.scene.visual.default.src.endsWith('woman-01.webp'));
assert.ok(
  session.scene.visual.default.responsive_src.endsWith('woman-01-sm.webp'),
);
const id = session.id;
const raced = await Promise.all(
  session.scene.choices.slice(0, 2).map((c: any) =>
    call('/api/session/answer', 'POST', {
      session_id: id,
      scene_id: session.scene.id,
      choice_id: c.id,
    }),
  ),
);
assert.deepEqual(
  raced.map((r) => r.status).sort((a, b) => a - b),
  [200, 409],
);
session = (await call('/api/session')).data;
assert.equal(session.completed_scenes, 1);
for (let i = 1; i < 15; i++) {
  const previous = JSON.stringify(session);
  const chosen = session.scene.choices[i % 4];
  const selectedVisual =
    session.scene.visual.choice_variants[chosen.id] ?? null;
  const response = await call('/api/session/answer', 'POST', {
    session_id: id,
    scene_id: session.scene.id,
    choice_id: chosen.id,
  });
  assert.equal(response.status, 200, JSON.stringify(response.data));
  session = response.data;
  if (selectedVisual) {
    assert.equal(session.scene.order, 11);
    assert.equal(session.scene.visual.default.src, selectedVisual.src);
  }
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
assert.equal(result.data.signal_assessment_available, true);
assert.ok(!JSON.stringify(result.data).includes('choiceEvidence'));
assert.ok(!JSON.stringify(result.data).includes('signedContribution'));
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
const magicLink = await call('/api/auth/request-link', 'POST', {
  email: 'qa-traveler@example.test',
});
assert.equal(magicLink.status, 200, JSON.stringify(magicLink.data));
assert.ok(magicLink.data.development_verify_url);
const magicToken = new URL(
  magicLink.data.development_verify_url,
).searchParams.get('token');
assert.ok(magicToken);
assert.equal(
  (await call('/api/auth/verify', 'POST', { token: magicToken })).status,
  200,
);
assert.ok(cookieJar.has('questype_auth'));
assert.equal(
  (await call('/api/auth/verify', 'POST', { token: magicToken })).status,
  409,
);
const claimed = await call('/api/account/claim', 'POST', {});
assert.equal(claimed.status, 200);
assert.equal(claimed.data.claimed, 1);
const duplicateClaim = await call('/api/account/claim', 'POST', {});
assert.equal(duplicateClaim.status, 200);
assert.equal(duplicateClaim.data.claimed, 0);
assert.equal(duplicateClaim.data.already_owned, 1);
const account = await call('/api/account');
assert.equal(account.status, 200);
assert.equal(account.data.results, 1);
const accumulated = await call('/api/profile');
assert.equal(accumulated.status, 200, JSON.stringify(accumulated.data));
assert.equal(accumulated.data.snapshot.journeysCompleted, 1);
assert.equal(accumulated.data.snapshot.decisionsAnalyzed, 15);
assert.equal(accumulated.data.snapshot.profileDepth, 'initial');
assert.ok(
  accumulated.data.snapshot.signals.some(
    (signal: any) => signal.status === 'unexplored',
  ),
);
assert.ok(!JSON.stringify(accumulated.data).includes('choiceEvidence'));
const snapshotId = accumulated.data.snapshot.id;
assert.equal((await call('/api/profile')).data.snapshot.id, snapshotId);
const profileReport = (await call('/api/profile/report'))
  .data as ProfileReportData;
assert.equal(profileReport.snapshotId, snapshotId);
assert.ok(!JSON.stringify(profileReport).includes('scientifically proven'));
const profilePdf = await renderProfileReportPdf(profileReport, {
  bodyFont: new Uint8Array(await readFile('public/fonts/body.woff')),
  headingFont: new Uint8Array(await readFile('public/fonts/heading.woff')),
});
await mkdir('artifacts/browser-qa', { recursive: true });
await writeFile(
  'artifacts/browser-qa/sample-accumulated-profile.pdf',
  profilePdf,
);
const authOnly = `questype_auth=${cookieJar.get('questype_auth')}`;
assert.equal(
  (
    await call(`/api/results/${resultId}`, 'GET', undefined, {
      Cookie: authOnly,
    })
  ).status,
  200,
);
assert.equal(
  (await call('/api/account/claim', 'POST', { resultId }, { Cookie: authOnly }))
    .status,
  409,
);
const mergeLink = await call('/api/auth/request-link', 'POST', {
  email: 'qa-traveler@example.test',
});
const mergeToken = new URL(
  mergeLink.data.development_verify_url,
).searchParams.get('token');
assert.ok(mergeToken);
assert.equal(
  (await call('/api/auth/verify', 'POST', { token: mergeToken })).status,
  200,
);
assert.equal((await call('/api/account')).data.results, 1);
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
assert.equal((await call(`/api/results/${resultId}`)).status, 200);
assert.equal((await call('/api/account', 'DELETE')).status, 200);
assert.equal((await call(`/api/results/${resultId}`)).status, 404);
assert.equal((await call('/api/account')).status, 401);
const summary = {
  passed: true,
  checks: [
    'anonymous start',
    'legacy route redirects',
    'Journey catalog and unknown-slug handling',
    'registered Journey identity and version',
    'manifest-driven responsive scene art',
    'choice visual carry-forward',
    'same-origin protection',
    'HttpOnly ownership cookie',
    'no client score maps',
    'concurrent conflicting choices',
    'idempotent answer retry',
    'resume after scene 8',
    '15-scene completion',
    'idempotent result generation',
    'exact score total',
    'private parallel signal persistence',
    'private result ownership',
    'passwordless local sign-in and replay protection',
    'secure anonymous-result claim and idempotent merge',
    'account-only cross-browser result access',
    'account deletion cascade',
    'immutable accumulated profile snapshot',
    'honest missing-signal rendering',
    'accumulated profile PDF',
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
