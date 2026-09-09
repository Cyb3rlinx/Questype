import { z } from 'zod';
import { ARCHETYPE_KEYS, MOTIVATION_KEYS, DECISION_KEYS, SHADOW_KEYS, archetypeSchema, answerSchema, dimensionKeySchema, userIdentitySchema, type Answer, type MotivationKey, type UserIdentity } from '../types.js';
import { calculateDimensionProfile, normalizeArchetypes, type ScoringEngine } from './engine.js';
import { determineShadowArchetype } from './shadow.js';
import { generateCharacterCandidates } from '../character/naming.js';

const numeric = z.number().finite();
const indexValue = z.number().int().min(0).max(100);
const rawMap = z.record(dimensionKeySchema, numeric);
const archetypeResultSchema = z.strictObject({ slug: z.enum(ARCHETYPE_KEYS), name: z.string(), raw_score: numeric, calibrated_score: numeric, proportion: z.number().min(0).max(1), normalized_percentage: indexValue });
const detailSchema = z.strictObject({ raw_score: numeric, normalized_value: indexValue, lower_bound: numeric, upper_bound: numeric, has_evidence: z.boolean(), positive_observations: z.number().int().nonnegative() });
const axisEvidenceSchema = z.strictObject({ positive: numeric, pressure: numeric, hits: z.number().int().nonnegative(), evidence_score: numeric, scene_ids: z.array(z.string()), pressure_scene_ids: z.array(z.string()) });
export const structuredProfileSchema = z.strictObject({
  id: z.uuid(), created_at: z.iso.datetime(), content_hash: z.string().regex(/^[a-f0-9]{64}$/),
  user: userIdentitySchema,
  journey: z.strictObject({ id: z.string(), journey_version: z.string(), scoring_version: z.string(), answers: z.array(answerSchema).min(12).max(15) }),
  archetypes: z.strictObject({
    primary: archetypeResultSchema, secondary: archetypeResultSchema, tertiary: archetypeResultSchema,
    all: z.array(archetypeResultSchema).length(12), tied_primary: z.array(z.enum(ARCHETYPE_KEYS)).min(1),
    shadow: z.strictObject({ slug: z.enum(ARCHETYPE_KEYS), evidence: z.enum(['supported', 'limited', 'insufficient']), score: numeric, dominant_axis: z.enum(SHADOW_KEYS).nullable(), axes: z.record(z.enum(SHADOW_KEYS), axisEvidenceSchema), candidates: z.array(z.strictObject({ slug: z.enum(ARCHETYPE_KEYS), score: numeric })).length(12) }),
  }),
  motivations: z.record(z.enum(MOTIVATION_KEYS), indexValue),
  decision_style: z.record(z.enum(DECISION_KEYS), indexValue),
  shadow_axis: z.record(z.enum(SHADOW_KEYS), indexValue), traits: z.record(dimensionKeySchema, indexValue),
  raw_scores: z.strictObject({ archetypes: rawMap, motivations: rawMap, decision_styles: rawMap, shadow: rawMap, traits: rawMap }),
  dimension_details: z.strictObject({ motivations: z.record(dimensionKeySchema, detailSchema), decision_styles: z.record(dimensionKeySchema, detailSchema), shadow: z.record(dimensionKeySchema, detailSchema), traits: z.record(dimensionKeySchema, detailSchema) }),
  character: z.strictObject({ title: z.string(), approved_candidates: z.array(z.string()).min(3).max(4), dominant_motivation: z.enum(MOTIVATION_KEYS) }),
  registry_snapshot: z.array(archetypeSchema).length(12),
}).superRefine((value, ctx) => {
  const all = value.archetypes.all;
  if (new Set(all.map(a => a.slug)).size !== 12) ctx.addIssue({ code: 'custom', message: 'Archetypes must be unique' });
  if (all.reduce((sum, a) => sum + a.normalized_percentage, 0) !== 100) ctx.addIssue({ code: 'custom', message: 'Percentages must total exactly 100' });
  if (Math.abs(all.reduce((sum, a) => sum + a.proportion, 0) - 1) > 1e-10) ctx.addIssue({ code: 'custom', message: 'Proportions must total one' });
  for (const [key, index] of [['primary', 0], ['secondary', 1], ['tertiary', 2]] as const) {
    if (JSON.stringify(value.archetypes[key]) !== JSON.stringify(all[index])) ctx.addIssue({ code: 'custom', message: `${key} disagrees with ranked result` });
  }
  if (!value.character.approved_candidates.includes(value.character.title)) ctx.addIssue({ code: 'custom', message: 'Unapproved character title' });
  all.forEach((a, i) => {
    const prior = all[i - 1];
    if (prior && (prior.calibrated_score < a.calibrated_score || (prior.calibrated_score === a.calibrated_score && ARCHETYPE_KEYS.indexOf(prior.slug) > ARCHETYPE_KEYS.indexOf(a.slug)))) ctx.addIssue({ code: 'custom', message: 'Archetype ranking is out of order' });
    if (value.raw_scores.archetypes[a.slug] !== a.raw_score) ctx.addIssue({ code: 'custom', message: 'Archetype raw score mismatch' });
  });
});
export type StructuredProfile = z.infer<typeof structuredProfileSchema>;

/** Reprojects stored results through the current presentation model. */
export function refreshArchetypePercentages(input: unknown): StructuredProfile {
  const profile = structuredProfileSchema.parse(input);
  const calibrated = Object.fromEntries(
    profile.archetypes.all.map((archetype) => [
      archetype.slug,
      archetype.calibrated_score,
    ]),
  ) as Record<(typeof ARCHETYPE_KEYS)[number], number>;
  const normalized = normalizeArchetypes(calibrated);
  const all = profile.archetypes.all.map((archetype) => ({
    ...archetype,
    proportion: normalized.proportions[archetype.slug],
    normalized_percentage: normalized.percentages[archetype.slug],
  }));
  return structuredProfileSchema.parse({
    ...profile,
    archetypes: {
      ...profile.archetypes,
      primary: all[0]!,
      secondary: all[1]!,
      tertiary: all[2]!,
      all,
    },
  });
}

export function generateStructuredProfile(engine: ScoringEngine, answers: readonly Answer[], user: UserIdentity, metadata: { id: string; created_at: string; content_hash: string }): StructuredProfile {
  const result = engine.evaluate(answers);
  const shadow = determineShadowArchetype(engine.content, result.answers, result.calibrated, result.primary.slug);
  const details = {
    motivations: calculateDimensionProfile(engine.content, result.raw, engine.calibration, result.answers, 'motivations'),
    decision_styles: calculateDimensionProfile(engine.content, result.raw, engine.calibration, result.answers, 'decision_styles'),
    shadow: calculateDimensionProfile(engine.content, result.raw, engine.calibration, result.answers, 'shadow'),
    traits: calculateDimensionProfile(engine.content, result.raw, engine.calibration, result.answers, 'traits'),
  };
  const values = (group: typeof details.motivations) => Object.fromEntries(Object.entries(group).map(([key, value]) => [key, value.normalized_value]));
  const motivations = values(details.motivations);
  const dominant = [...MOTIVATION_KEYS].sort((a, b) => motivations[b]! - motivations[a]! || MOTIVATION_KEYS.indexOf(a) - MOTIVATION_KEYS.indexOf(b))[0] as MotivationKey;
  const approved = generateCharacterCandidates({ primary: result.primary.slug, secondary: result.secondary.slug, dominantMotivation: dominant, shadowAxis: shadow.dominant_axis, shadowEvidence: shadow.evidence });
  return structuredProfileSchema.parse({
    ...metadata, user,
    journey: { id: engine.content.id, journey_version: engine.content.journey_version, scoring_version: engine.content.scoring_version, answers: result.answers },
    archetypes: { primary: result.primary, secondary: result.secondary, tertiary: result.tertiary, all: result.all, tied_primary: result.tied_primary, shadow },
    motivations, decision_style: values(details.decision_styles), shadow_axis: values(details.shadow), traits: values(details.traits),
    raw_scores: result.raw, dimension_details: details,
    character: { title: approved[0]!, approved_candidates: approved, dominant_motivation: dominant },
    registry_snapshot: engine.content.archetypes,
  });
}
