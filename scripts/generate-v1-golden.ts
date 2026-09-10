import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { createScoringEngine } from '../src/domain/scoring/engine.js';
import { generateStructuredProfile } from '../src/domain/scoring/profile.js';
import { contentHash } from '../src/database/content-hash.js';
import { deterministicInterpretation } from '../src/ai/fallback.js';
import { generateReportData } from '../src/reports/data.js';
import { createPublicProjection } from '../src/sharing/contracts.js';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

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

function choicesFromIndices(indices: string) {
  if (!/^\d{15}$/.test(indices)) throw new Error(`Invalid choice indices: ${indices}`);
  return journeyV1.scenes.map((scene, index) => scene.choices[Number(indices[index])]!.id);
}

const balancePath = new URL('../artifacts/balance-report.json', import.meta.url);
const balance = JSON.parse(await readFile(balancePath, 'utf8')) as {
  archetypes: { archetype: string; witness: string[] }[];
};
const witnessCases = balance.archetypes.map(({ archetype, witness }) => ({
  name: `primary-${archetype}`,
  choices: witness,
}));
const specialCases = [
  {
    name: 'three-way-primary-tie',
    choices: choicesFromIndices('222101130303211'),
  },
  {
    name: 'limited-shadow-evidence',
    choices: choicesFromIndices('022032122003020'),
  },
];

const engine = createScoringEngine(journeyV1);
const metadata = {
  id: '10000000-0000-4000-8000-000000000001',
  created_at: '2026-09-03T01:00:00.000Z',
  content_hash: contentHash(journeyV1),
};
const user = { name: 'Golden Traveler', character_gender: 'man' as const };

const cases = [...witnessCases, ...specialCases].map((fixture) => {
  const answers = journeyV1.scenes.map((scene, index) => ({
    scene_id: scene.id,
    choice_id: fixture.choices[index]!,
  }));
  const profile = generateStructuredProfile(engine, answers, user, metadata);
  const localeHashes = Object.fromEntries(
    (['en', 'es'] as const).map((locale) => {
      const interpretation = deterministicInterpretation(profile, locale).interpretation;
      const report = generateReportData(profile, interpretation, null, locale);
      const share = createPublicProjection(profile, {
        includeName: true,
        topCount: 2,
        quote: interpretation.social.quote,
        imageUrl: null,
        locale,
      });
      return [locale, digest({ interpretation, report, share })];
    }),
  );
  return {
    name: fixture.name,
    choices: fixture.choices,
    expected: {
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
      profile_hash: digest(profile),
      locale_hashes: localeHashes,
    },
  };
});

const fixture = {
  fixture_version: 1,
  journey_id: journeyV1.id,
  journey_version: journeyV1.journey_version,
  scoring_version: journeyV1.scoring_version,
  content_hash: metadata.content_hash,
  canonicalization: 'recursive-key-sort + JSON + SHA-256',
  cases,
};
const outputPath = fileURLToPath(
  new URL('../tests/golden/v1-results.json', import.meta.url),
);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
console.log(`Wrote ${cases.length} V1 golden cases to ${outputPath}`);
