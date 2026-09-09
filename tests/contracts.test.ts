import test from 'node:test';
import assert from 'node:assert/strict';
import { deterministicInterpretation } from '../src/ai/fallback.js';
import { interpretationSchema, validateInterpretation } from '../src/ai/contracts.js';
import { generateReportData, REPORT_SECTION_TITLES, REPORT_SECTION_TITLES_ES, DISCLAIMER, DISCLAIMER_ES } from '../src/reports/data.js';
import { createPublicProjection, publicResultSchema, CARD_FORMATS } from '../src/sharing/contracts.js';
import { generateCharacterCandidates } from '../src/domain/character/naming.js';
import { contentHash } from '../src/database/content-hash.js';
import { content, sampleProfile } from './fixtures.js';
import { archetypeImage } from '../src/domain/archetype-images.js';
import { ARCHETYPE_KEYS } from '../src/domain/types.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

test('deterministic interpretation is labelled and satisfies the bounded AI contract', () => {
  const profile = sampleProfile(); const fallback = deterministicInterpretation(profile);
  assert.equal(fallback.provider, 'deterministic');
  assert.ok(interpretationSchema.safeParse(fallback.interpretation).success);
  assert.deepEqual(fallback, deterministicInterpretation(profile));
  assert.ok(fallback.interpretation.summary.split(/\s+/).length >= 100);
});
test('AI cannot add scores, change an approved title, omit content or emit a diagnosis', () => {
  const profile = sampleProfile(); const valid = deterministicInterpretation(profile).interpretation;
  assert.throws(() => validateInterpretation({ ...valid, scores: {} }, profile));
  assert.throws(() => validateInterpretation({ ...valid, character_title: 'The Arbitrary Oracle' }, profile));
  assert.throws(() => validateInterpretation({ ...valid, strengths: [] }, profile));
  assert.throws(() => validateInterpretation({ ...valid, summary: 'Too short.' }, profile));
  assert.throws(() => validateInterpretation({ ...valid, relationships: 'You have attachment trauma.' }, profile));
  assert.throws(() => validateInterpretation({ ...valid, relationships: '<script>alert(1)</script>' }, profile));
  assert.throws(() => validateInterpretation({ ...valid, social: { ...valid.social, primary_archetype: 'hero' } }, profile));
});
test('weak shadow evidence requires cautious language', () => {
  const profile = sampleProfile();
  profile.archetypes.shadow.evidence = 'limited';
  const fallback = deterministicInterpretation(profile).interpretation;
  assert.match(fallback.shadow_analysis, /limited/);
  assert.throws(() => validateInterpretation({ ...fallback, shadow_analysis: 'Your pressure pattern clearly establishes control as your main response.' }, profile));
});
test('character candidates combine primary, secondary, motivation and supported shadow', () => {
  const candidates = generateCharacterCandidates({ primary: 'magician', secondary: 'explorer', dominantMotivation: 'knowledge', shadowAxis: 'control', shadowEvidence: 'supported' });
  assert.equal(candidates[0], 'The Wandering Magician');
  assert.ok(candidates.includes('The Crownless Magician'));
  const weak = generateCharacterCandidates({ primary: 'magician', secondary: 'explorer', dominantMotivation: 'knowledge', shadowAxis: 'control', shadowEvidence: 'limited' });
  assert.equal(weak.length, 3);
});
test('report data includes a personalized cover, twelve ordered sections and notice', () => {
  const profile = sampleProfile();
  const report = generateReportData(profile, deterministicInterpretation(profile).interpretation);
  assert.equal(report.cover.user_name, profile.user.name);
  assert.equal(report.cover.date, profile.created_at);
  assert.equal(report.cover.character_image_url, null);
  assert.deepEqual(report.sections.map(s => s.title), [...REPORT_SECTION_TITLES]);
  assert.equal(report.sections[1]!.paragraphs.length, 12);
  assert.equal(report.disclaimer, DISCLAIMER);
});
test('Spanish interpretation, report and public projection remain fully localized', () => {
  const profile = sampleProfile();
  const interpretation = deterministicInterpretation(profile, 'es').interpretation;
  const report = generateReportData(profile, interpretation, null, 'es');
  const shared = createPublicProjection(profile, { includeName: false, topCount: 2, quote: interpretation.social.quote, imageUrl: null, locale: 'es' });
  assert.equal(report.locale, 'es');
  assert.deepEqual(report.sections.map(section => section.title), [...REPORT_SECTION_TITLES_ES]);
  assert.equal(report.disclaimer, DISCLAIMER_ES);
  assert.match(interpretation.summary, /Tu recorrido/);
  assert.equal(shared.locale, 'es');
  assert.notEqual(shared.archetypes[0]!.name, profile.archetypes.primary.name);
});
test('public projection omits names unless selected and cannot expose raw answers', () => {
  const profile = sampleProfile();
  const selection = { includeName: false, topCount: 2 as const, quote: 'The road remains open.', imageUrl: null };
  const publicResult = createPublicProjection(profile, selection);
  assert.equal(publicResult.display_name, null);
  assert.equal(publicResult.archetypes.length, 2);
  assert.equal(publicResultSchema.safeParse({ ...publicResult, answers: profile.journey.answers }).success, false);
  assert.equal(createPublicProjection(profile, { ...selection, includeName: true }).display_name, profile.user.name);
  assert.ok(!JSON.stringify(publicResult).includes('shadow'));
  assert.equal(CARD_FORMATS.instagram_portrait.width / CARD_FORMATS.instagram_portrait.height, 4 / 5);
  assert.equal(CARD_FORMATS.instagram_story.width / CARD_FORMATS.instagram_story.height, 9 / 16);
});
test('content hashes are independent of object key insertion order and sensitive to actual edits', () => {
  const shuffled = Object.fromEntries(Object.entries(content).reverse()) as typeof content;
  assert.equal(contentHash(content), contentHash(shuffled));
  const edited = structuredClone(content); edited.scenes[0]!.narrative += ' An added sentence.';
  assert.notEqual(contentHash(edited), contentHash(content));
});
test('every archetype has optimized result art for both representations', () => {
  for (const slug of ARCHETYPE_KEYS) for (const gender of ['man', 'woman'] as const) {
    const source = archetypeImage(slug, gender);
    assert.ok(existsSync(join(process.cwd(), 'public', source.replace('/images/', 'images/'))), `Missing ${source}`);
  }
});
