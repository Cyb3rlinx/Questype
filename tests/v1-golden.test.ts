import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { deterministicInterpretation } from '../src/ai/fallback.js';
import { contentHash } from '../src/database/content-hash.js';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { createScoringEngine } from '../src/domain/scoring/engine.js';
import { generateStructuredProfile } from '../src/domain/scoring/profile.js';
import { generateReportData } from '../src/reports/data.js';
import { createPublicProjection } from '../src/sharing/contracts.js';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type GoldenCase = {
  name: string;
  choices: string[];
  expected: {
    primary: string;
    secondary: string;
    tertiary: string;
    tied_primary: string[];
    percentages: [string, number][];
    shadow: { slug: string; evidence: string; dominant_axis: string | null };
    character_title: string;
    dominant_motivation: string;
    profile_hash: string;
    locale_hashes: Record<'en' | 'es', string>;
  };
};

function canonical(value: unknown): Json {
  if (value === null || typeof value !== 'object') return value as Json;
  if (Array.isArray(value)) return value.map(canonical);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, canonical(item)]),
  );
}

function digest(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}

const golden = JSON.parse(
  await readFile(new URL('./golden/v1-results.json', import.meta.url), 'utf8'),
) as {
  fixture_version: number;
  journey_id: string;
  journey_version: string;
  scoring_version: string;
  content_hash: string;
  cases: GoldenCase[];
};
const engine = createScoringEngine(journeyV1);
const metadata = {
  id: '10000000-0000-4000-8000-000000000001',
  created_at: '2026-09-03T01:00:00.000Z',
  content_hash: contentHash(journeyV1),
};

test('V1 golden fixture identifies the released content exactly', () => {
  assert.equal(golden.fixture_version, 1);
  assert.equal(golden.journey_id, journeyV1.id);
  assert.equal(golden.journey_version, journeyV1.journey_version);
  assert.equal(golden.scoring_version, journeyV1.scoring_version);
  assert.equal(golden.content_hash, metadata.content_hash);
  assert.equal(golden.cases.length, 14);
});

for (const fixture of golden.cases) {
  test(`V1 golden result remains stable: ${fixture.name}`, () => {
    const answers = journeyV1.scenes.map((scene, index) => ({
      scene_id: scene.id,
      choice_id: fixture.choices[index]!,
    }));
    const profile = generateStructuredProfile(
      engine,
      answers,
      { name: 'Golden Traveler', character_gender: 'man' },
      metadata,
    );
    assert.deepEqual(
      {
        primary: profile.archetypes.primary.slug,
        secondary: profile.archetypes.secondary.slug,
        tertiary: profile.archetypes.tertiary.slug,
        tied_primary: profile.archetypes.tied_primary,
        percentages: profile.archetypes.all.map((item) => [
          item.slug,
          item.normalized_percentage,
        ]),
        shadow: {
          slug: profile.archetypes.shadow.slug,
          evidence: profile.archetypes.shadow.evidence,
          dominant_axis: profile.archetypes.shadow.dominant_axis,
        },
        character_title: profile.character.title,
        dominant_motivation: profile.character.dominant_motivation,
      },
      {
        primary: fixture.expected.primary,
        secondary: fixture.expected.secondary,
        tertiary: fixture.expected.tertiary,
        tied_primary: fixture.expected.tied_primary,
        percentages: fixture.expected.percentages,
        shadow: fixture.expected.shadow,
        character_title: fixture.expected.character_title,
        dominant_motivation: fixture.expected.dominant_motivation,
      },
    );
    assert.equal(digest(profile), fixture.expected.profile_hash);

    for (const locale of ['en', 'es'] as const) {
      const interpretation = deterministicInterpretation(profile, locale).interpretation;
      const report = generateReportData(profile, interpretation, null, locale);
      const share = createPublicProjection(profile, {
        includeName: true,
        topCount: 2,
        quote: interpretation.social.quote,
        imageUrl: null,
        locale,
      });
      assert.equal(
        digest({ interpretation, report, share }),
        fixture.expected.locale_hashes[locale],
      );
    }
  });
}
