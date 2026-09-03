import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { createScoringEngine } from '../src/domain/scoring/engine.js';
import { generateStructuredProfile } from '../src/domain/scoring/profile.js';
import { contentHash } from '../src/database/content-hash.js';
import type { Gender } from '../src/domain/types.js';
export const content = journeyV1;
export const engine = createScoringEngine(content);
export const answers = content.scenes.map(s => ({ scene_id: s.id, choice_id: s.choices[0]!.id }));
export const metadata = { id: '10000000-0000-4000-8000-000000000001', created_at: '2026-09-03T01:00:00.000Z', content_hash: contentHash(content) };
export function sampleProfile(gender: Gender = 'man') { return generateStructuredProfile(engine, answers, { name: 'Test Traveler', character_gender: gender }, metadata); }
