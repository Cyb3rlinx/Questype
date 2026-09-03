import { mkdir, writeFile } from 'node:fs/promises';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { createScoringEngine } from '../src/domain/scoring/engine.js';
import { generateStructuredProfile } from '../src/domain/scoring/profile.js';
import { contentHash } from '../src/database/content-hash.js';
import { deterministicInterpretation } from '../src/ai/fallback.js';
import { generateReportData } from '../src/reports/data.js';

const path = [0, 0, 2, 1, 2, 3, 1, 2, 3, 2, 3, 1, 0, 1, 0];
const answers = journeyV1.scenes.map((s, i) => ({ scene_id: s.id, choice_id: s.choices[path[i]!]!.id }));
const profile = generateStructuredProfile(createScoringEngine(journeyV1), answers, { name: 'Sample Traveler', character_gender: 'woman' }, {
  id: '10000000-0000-4000-8000-000000000001', created_at: '2026-09-03T00:00:00.000Z', content_hash: contentHash(journeyV1),
});
const fallback = deterministicInterpretation(profile);
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/example-profile.json', import.meta.url), JSON.stringify({ sample_data: true, profile, interpretation: fallback, report_data: generateReportData(profile, fallback.interpretation) }, null, 2) + '\n');
console.log({ sample_data: true, character: profile.character.title, primary: profile.archetypes.primary.name, secondary: profile.archetypes.secondary.name, shadow: profile.archetypes.shadow.slug, interpretation_provider: fallback.provider, output: 'artifacts/example-profile.json' });
