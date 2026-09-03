import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, restoreSession, acceptAnswer, markSessionCompleted, toPublicScene, toProgressHint } from '../src/domain/journey/session.js';
import { content, answers } from './fixtures.js';

const newSession = () => createSession(content, { name: null, character_gender: 'woman' }, { id: '20000000-0000-4000-8000-000000000001', started_at: '2026-09-03T00:00:00.000Z' });
test('anonymous state resumes after eight persisted answers', () => {
  let session = newSession();
  for (const answer of answers.slice(0, 8)) session = acceptAnswer(content, session, answer);
  const resumed = restoreSession(content, JSON.parse(JSON.stringify(session)));
  assert.equal(resumed.current_scene, 9);
  assert.equal(resumed.answers.length, 8);
  assert.deepEqual(resumed, session);
});
test('answer retry is idempotent; a conflicting accepted answer fails', () => {
  const first = acceptAnswer(content, newSession(), answers[0]!);
  assert.deepEqual(acceptAnswer(content, first, answers[0]!), first);
  assert.throws(() => acceptAnswer(content, first, { scene_id: 'scene_01', choice_id: 'scene_01_choice_b' }), /already accepted/);
  assert.equal(newSession().answers.length, 0);
});
test('fifteen answers transition to processing before explicit completion', () => {
  let session = newSession();
  for (const answer of answers) session = acceptAnswer(content, session, answer);
  assert.equal(session.status, 'processing');
  assert.equal(session.current_scene, 16);
  const complete = markSessionCompleted(content, session, '2026-09-03T01:00:00.000Z');
  assert.equal(complete.status, 'completed');
  assert.deepEqual(markSessionCompleted(content, complete, '2026-09-03T02:00:00.000Z'), complete);
  assert.throws(() => markSessionCompleted(content, newSession(), '2026-09-03T01:00:00.000Z'));
});
test('invalid stored state, mismatched versions and skipped scenes are rejected', () => {
  const session = newSession();
  assert.throws(() => restoreSession(content, { ...session, current_scene: 8 }));
  assert.throws(() => restoreSession(content, { ...session, journey_version: '2.0' }));
  assert.throws(() => restoreSession(content, { ...session, status: 'completed' }));
  assert.throws(() => acceptAnswer(content, session, answers[1]!));
  assert.throws(() => createSession(content, { name: 'x'.repeat(61), character_gender: 'woman' }, { id: session.id, started_at: session.started_at }));
});
test('public scene DTOs and browser hints contain no psychological or private fields', () => {
  const dto = toPublicScene(content.scenes[0]!, 'woman');
  assert.deepEqual(Object.keys(dto).sort(), ['act', 'choices', 'id', 'narrative', 'order', 'title']);
  assert.deepEqual(Object.keys(dto.choices[0]!).sort(), ['id', 'text']);
  assert.ok(!JSON.stringify(dto).includes('scores'));
  assert.deepEqual(Object.keys(toProgressHint(newSession())).sort(), ['current_scene', 'schema_version', 'session_id']);
});
test('representation variants change narrative text only and preserve choice identity', () => {
  const scene = structuredClone(content.scenes[0]!);
  scene.male_variant = 'His road begins here. '.repeat(4);
  scene.female_variant = 'Her road begins here. '.repeat(4);
  const man = toPublicScene(scene, 'man'); const woman = toPublicScene(scene, 'woman');
  assert.notEqual(man.narrative, woman.narrative);
  assert.deepEqual(man.choices.map(c => c.id), woman.choices.map(c => c.id));
});
