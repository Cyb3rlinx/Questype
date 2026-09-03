import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPE_KEYS, type ArchetypeKey } from '../src/domain/types.js';
import { calculateScores, calculateCalibration, calculateDimensionProfile, normalizeArchetypes, rankArchetypes, createScoringEngine } from '../src/domain/scoring/engine.js';
import { determineShadowArchetype } from '../src/domain/scoring/shadow.js';
import { generateStructuredProfile, structuredProfileSchema } from '../src/domain/scoring/profile.js';
import { validateContent } from '../src/domain/content/validate.js';
import { simulateJourneys, seededRandom } from '../src/domain/scoring/simulation.js';
import { content, answers, engine, metadata, sampleProfile } from './fixtures.js';

const equalScores = (value: number) => Object.fromEntries(ARCHETYPE_KEYS.map(k => [k, value])) as Record<ArchetypeKey, number>;

test('released content has all dimensions and complete, unique scenes', () => {
  assert.deepEqual(validateContent(content), { errors: [], warnings: [] });
  assert.equal(content.scenes.length, 15);
  assert.equal(content.scenes.reduce((n, s) => n + s.choices.length, 0), 60);
  assert.equal(content.dimensions.length, 36);
  assert.ok(Object.isFrozen(content.scenes[0]!.choices[0]!.scores));
});
test('raw calculation accumulates only canonical chosen effects and keeps zero keys', () => {
  const result = calculateScores(content, answers.slice(0, 2));
  assert.equal(result.archetypes.explorer, 3);
  assert.equal(result.archetypes.creator, 3);
  assert.equal(result.archetypes.magician, 1);
  assert.equal(result.archetypes.sage, 1);
  assert.equal(result.archetypes.ruler, 0);
  assert.equal(result.motivations.freedom, 2);
  assert.equal(result.motivations.creation, 2);
  assert.equal(result.decision_styles.intuitive, 1);
  assert.equal(Object.keys(result.archetypes).length, 12);
});
test('negative and zero signals are retained', () => {
  const path = answers.map(a => ({ ...a }));
  path[11]!.choice_id = content.scenes[11]!.choices[0]!.id;
  path[12]!.choice_id = content.scenes[12]!.choices[2]!.id;
  const raw = calculateScores(content, path);
  assert.equal(raw.shadow.emotional_detachment, -2);
  assert.equal(raw.traits.autonomy, 2); // +1 at scene 10, -1 at scene 12, +2 at scene 15.
  assert.equal(raw.shadow.rebellion, 0);
});
test('rejects duplicate, foreign, out-of-order, extra and incomplete answers', () => {
  assert.throws(() => calculateScores(content, [answers[0]!, answers[0]!]));
  assert.throws(() => calculateScores(content, [{ scene_id: answers[0]!.scene_id, choice_id: answers[1]!.choice_id }]));
  assert.throws(() => calculateScores(content, [answers[1]!]));
  assert.throws(() => engine.evaluate(answers.slice(0, 14)));
  assert.throws(() => engine.evaluate([...answers, answers[0]!]));
  assert.throws(() => calculateScores(content, [{ ...answers[0]!, scores: { explorer: 999 } } as never]));
});
test('normalization is signed, translation invariant and sums to exactly 100', () => {
  const scores = Object.fromEntries(ARCHETYPE_KEYS.map((k, i) => [k, i - 12])) as Record<ArchetypeKey, number>;
  const shifted = Object.fromEntries(ARCHETYPE_KEYS.map(k => [k, scores[k] + 100])) as Record<ArchetypeKey, number>;
  const a = normalizeArchetypes(scores);
  assert.equal(Object.values(a.percentages).reduce((sum, p) => sum + p, 0), 100);
  assert.deepEqual(a, normalizeArchetypes(shifted));
  assert.ok(Object.values(a.percentages).every(Number.isInteger));
});
test('normalization is stable for huge finite magnitudes and deterministic for ties', () => {
  const uniform = normalizeArchetypes(equalScores(-1e308));
  assert.deepEqual(Object.values(uniform.percentages), [9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 8]);
  const huge = equalScores(-1e308); huge.magician = 1e308;
  assert.equal(normalizeArchetypes(huge).percentages.magician, 100);
  assert.throws(() => normalizeArchetypes({ ...huge, sage: NaN }));
  assert.throws(() => normalizeArchetypes({ ...huge, sage: Infinity }));
  assert.throws(() => normalizeArchetypes(huge, 0));
  assert.throws(() => normalizeArchetypes({} as never));
});
test('calibration accounts for opportunity exposure with exact scene bounds', () => {
  const c = calculateCalibration(content, [content.scenes[0]!]);
  assert.equal(c.archetypes.explorer!.mean, 0.75);
  assert.equal(c.archetypes.explorer!.variance, 1.6875);
  assert.equal(c.archetypes.explorer!.lower, 0);
  assert.equal(c.archetypes.explorer!.upper, 3);
});
test('ranking uses unrounded values and canonical tie order independently of input order', () => {
  const tied = ARCHETYPE_KEYS.map(slug => ({ slug, name: slug, raw_score: 0, calibrated_score: 0, normalized_percentage: 8, proportion: 1 / 12 })).reverse();
  assert.deepEqual(rankArchetypes(tied).map(a => a.slug), [...ARCHETYPE_KEYS]);
  tied.find(a => a.slug === 'magician')!.calibrated_score = 0.000001;
  assert.equal(rankArchetypes(tied)[0]!.slug, 'magician');
  assert.equal(tied[0]!.slug, 'everyman'); // Ranking did not reorder the caller's array.
});
test('same input generates identical complete profiles and rejects altered snapshots', () => {
  const first = sampleProfile();
  assert.deepEqual(first, sampleProfile());
  assert.equal(first.archetypes.all.reduce((sum, a) => sum + a.normalized_percentage, 0), 100);
  assert.equal(new Set([first.archetypes.primary.slug, first.archetypes.secondary.slug, first.archetypes.tertiary.slug]).size, 3);
  const changed = structuredClone(first); changed.archetypes.primary.normalized_percentage++;
  assert.equal(structuredProfileSchema.safeParse(changed).success, false);
});
test('representation and names do not change any psychological output across 100 paths', () => {
  const random = seededRandom(91);
  for (let i = 0; i < 100; i++) {
    const path = content.scenes.map(s => ({ scene_id: s.id, choice_id: s.choices[Math.floor(random() * 4)]!.id }));
    const man = generateStructuredProfile(engine, path, { name: 'A', character_gender: 'man' }, metadata);
    const woman = generateStructuredProfile(engine, path, { name: 'Different name', character_gender: 'woman' }, metadata);
    const { user: _man, ...a } = man; const { user: _woman, ...b } = woman;
    assert.deepEqual(a, b);
  }
});
test('shadow uses repeat and pressure evidence, never the lowest-score rule', () => {
  const profile = sampleProfile();
  assert.equal(profile.archetypes.shadow.evidence, 'supported');
  assert.ok(profile.archetypes.shadow.candidates[0]!.score > 0);
  const altered = structuredClone(content);
  altered.scenes.forEach(s => s.choices.forEach(c => { c.scores.shadow = {}; }));
  const noEvidence = determineShadowArchetype(altered, answers, equalScores(0), 'explorer');
  assert.equal(noEvidence.evidence, 'insufficient');
  assert.equal(noEvidence.slug, 'explorer');
  altered.scenes[11]!.choices[0]!.scores.shadow = { control: 3 };
  const single = determineShadowArchetype(altered, answers, equalScores(0), 'explorer');
  assert.equal(single.evidence, 'limited');
  assert.equal(single.axes.control.evidence_score, 2); // (3 positive + 3 pressure) / 3.
  altered.scenes[8]!.choices[0]!.scores.shadow = { control: 1 };
  const calibrated = equalScores(0); calibrated.ruler = 3; calibrated.sage = -3;
  const repeated = determineShadowArchetype(altered, answers, calibrated, 'ruler');
  assert.equal(repeated.evidence, 'supported');
  assert.equal(repeated.slug, 'ruler');
  assert.notEqual(repeated.slug, 'sage'); // Evidence selects the highest-scoring identity here, not the lowest.
});
test('arbitrary trait dimensions extend without changes to scoring schema', () => {
  const extended = structuredClone(content);
  extended.dimensions.push({ group: 'traits', key: 'ambiguity_tolerance', label: 'Ambiguity tolerance', description: 'Space for uncertainty while taking a useful next step.' });
  extended.scenes[0]!.choices[0]!.scores.traits.ambiguity_tolerance = 2;
  extended.dimensions.push({ group: 'traits', key: 'future_unused_trait', label: 'Future trait', description: 'A registered dimension without evidence yet.' });
  const custom = createScoringEngine(extended);
  const raw = custom.evaluate(answers).raw;
  const traits = calculateDimensionProfile(custom.content, raw, custom.calibration, answers, 'traits');
  assert.equal(traits.ambiguity_tolerance!.normalized_value, 100);
  assert.equal(traits.future_unused_trait!.has_evidence, false);
  assert.equal(traits.future_unused_trait!.normalized_value, 0);
});
test('invalid weights, keys, representation scoring and non-varying archetypes fail content validation', () => {
  const altered = structuredClone(content);
  altered.scenes[0]!.choices[0]!.scores.archetypes.explorer = 9;
  assert.ok(validateContent(altered).errors.length);
  altered.scenes[0]!.choices[0]!.scores.archetypes.explorer = 3;
  altered.scenes[0]!.choices[0]!.scores.motivations.unknown = 1;
  assert.ok(validateContent(altered).errors.some(e => e.includes('Unknown dimension')));
  delete altered.scenes[0]!.choices[0]!.scores.motivations.unknown;
  altered.scenes[0]!.choices[0]!.male_variant = { scores: { explorer: 3 } } as never;
  assert.ok(validateContent(altered).errors.length);
  const zero = structuredClone(content);
  zero.scenes.forEach(s => s.choices.forEach(c => { delete c.scores.archetypes.magician; }));
  assert.throws(() => createScoringEngine(zero), /variation/);
});
test('scoring engine owns its snapshot and rejects unsupported scoring versions', () => {
  const mutable = structuredClone(content);
  const own = createScoringEngine(mutable);
  const before = own.evaluate(answers);
  mutable.scenes[0]!.choices[0]!.scores.archetypes.explorer = -3;
  assert.deepEqual(own.evaluate(answers), before);
  mutable.scoring_version = '2.0';
  assert.throws(() => createScoringEngine(mutable), /Unsupported/);
});
test('seeded simulations are reproducible and supply twelve constructive outcome paths', () => {
  const report = simulateJourneys(content, 1000, 810);
  assert.deepEqual(report, simulateJourneys(content, 1000, 810));
  assert.deepEqual(report.errors, []);
  assert.equal(report.archetypes.reduce((sum, a) => sum + a.primary_count, 0), 1000);
  for (const row of report.archetypes) {
    assert.ok(row.witness);
    assert.equal(engine.evaluate(row.witness!.map((choice_id, i) => ({ scene_id: content.scenes[i]!.id, choice_id }))).primary.slug, row.archetype);
  }
});
