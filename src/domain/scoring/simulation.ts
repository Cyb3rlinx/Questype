import { ARCHETYPE_KEYS, type Answer, type ArchetypeKey, type JourneyContent } from '../types.js';
import { validateContent } from '../content/validate.js';
import { createScoringEngine } from './engine.js';

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
export function simulateJourneys(content: JourneyContent, count = 10_000, seed = 20260903) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 1_000_000) throw new Error('Simulation count must be 1–1,000,000');
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Seed must be an unsigned 32-bit integer');
  const engine = createScoringEngine(content);
  const random = seededRandom(seed);
  const rows = ARCHETYPE_KEYS.map(key => {
    const choices = content.scenes.flatMap(s => s.choices);
    const weights = choices.map(c => c.scores.archetypes[key] ?? 0);
    const baseline = engine.calibration.archetypes[key]!;
    return { archetype: key, positive_opportunities: weights.filter(w => w > 0).length,
      positive_weight: weights.reduce((sum, w) => sum + Math.max(0, w), 0),
      negative_weight: weights.reduce((sum, w) => sum + Math.min(0, w), 0),
      scenes_with_signal: content.scenes.filter(s => s.choices.some(c => (c.scores.archetypes[key] ?? 0) !== 0)).length,
      baseline_mean: baseline.mean, baseline_stddev: Math.sqrt(baseline.variance),
      primary_count: 0, secondary_count: 0, primary_frequency: 0, secondary_frequency: 0,
      average_percentage: 0, witness: null as string[] | null,
    };
  });
  const byKey = Object.fromEntries(rows.map(row => [row.archetype, row])) as Record<ArchetypeKey, typeof rows[number]>;
  let tiedJourneys = 0;
  for (let i = 0; i < count; i++) {
    const answers = content.scenes.map(s => ({ scene_id: s.id, choice_id: s.choices[Math.floor(random() * s.choices.length)]!.id }));
    const result = engine.evaluate(answers);
    const primary = byKey[result.primary.slug];
    primary.primary_count++; byKey[result.secondary.slug].secondary_count++;
    if (!primary.witness) primary.witness = answers.map(a => a.choice_id);
    if (result.tied_primary.length > 1) tiedJourneys++;
    for (const a of result.all) byKey[a.slug].average_percentage += a.normalized_percentage / count;
  }
  const audit = validateContent(content);
  const warnings = [...audit.warnings];
  const errors = [...audit.errors];
  const averageExposure = rows.reduce((sum, r) => sum + r.positive_opportunities, 0) / rows.length;
  for (const row of rows) {
    row.primary_frequency = row.primary_count / count * 100;
    row.secondary_frequency = row.secondary_count / count * 100;
    if (Math.abs(row.positive_opportunities / averageExposure - 1) > 0.4) warnings.push(`Opportunity imbalance: ${row.archetype} has ${row.positive_opportunities} positive options vs mean ${averageExposure.toFixed(2)}`);
    if (row.primary_frequency < 3 || row.primary_frequency > 16) warnings.push(`Primary frequency outside 3–16%: ${row.archetype} = ${row.primary_frequency.toFixed(2)}%`);
    if (row.primary_count === 0) warnings.push(`No random primary outcome observed: ${row.archetype}`);
    if (!row.witness) {
      const maximizing: Answer[] = content.scenes.map(s => ({ scene_id: s.id, choice_id: [...s.choices].sort((a, b) => (b.scores.archetypes[row.archetype] ?? 0) - (a.scores.archetypes[row.archetype] ?? 0))[0]!.id }));
      if (engine.evaluate(maximizing).primary.slug === row.archetype) row.witness = maximizing.map(a => a.choice_id);
    }
    if (!row.witness) errors.push(`Reachability unproven: ${row.archetype}; inspect content or use a constraint solver`);
  }
  return { journey_id: content.id, journey_version: content.journey_version, scoring_version: content.scoring_version,
    seed, journeys: count, choices_per_scene: content.scenes.map(s => s.choices.length), top_tie_count: tiedJourneys,
    normalization: 'Exposure-calibrated stable softmax T=1; whole-percent largest remainder',
    caveat: 'Uniform independent fictional choices test mechanics, not human population balance or psychometric validity.',
    archetypes: rows, warnings, errors,
  };
}
