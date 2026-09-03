import { z } from 'zod';

export const ARCHETYPE_KEYS = ['innocent', 'explorer', 'sage', 'hero', 'outlaw', 'magician', 'lover', 'creator', 'caregiver', 'jester', 'ruler', 'everyman'] as const;
export const MOTIVATION_KEYS = ['power', 'freedom', 'connection', 'creation', 'knowledge', 'protection'] as const;
export const DECISION_KEYS = ['impulsive', 'strategic', 'intuitive', 'rational', 'protective', 'dominant'] as const;
export const SHADOW_KEYS = ['control', 'avoidance', 'self_sacrifice', 'rebellion', 'obsession', 'emotional_detachment'] as const;
export const SCORE_GROUPS = ['archetypes', 'motivations', 'decision_styles', 'shadow', 'traits'] as const;
export type ArchetypeKey = typeof ARCHETYPE_KEYS[number];
export type MotivationKey = typeof MOTIVATION_KEYS[number];
export type DecisionKey = typeof DECISION_KEYS[number];
export type ShadowKey = typeof SHADOW_KEYS[number];
export type ScoreGroup = typeof SCORE_GROUPS[number];
export type Gender = 'man' | 'woman';

export const dimensionKeySchema = z.string().regex(/^[a-z][a-z0-9_]{0,63}$/)
  .refine(key => !['constructor', 'prototype', '__proto__'].includes(key), 'Reserved dimension key');
const weightSchema = z.number().int().min(-3).max(3);
const weightMap = z.record(dimensionKeySchema, weightSchema);
export const scoreEffectsSchema = z.strictObject({
  archetypes: weightMap.default({}), motivations: weightMap.default({}),
  decision_styles: weightMap.default({}), shadow: weightMap.default({}), traits: weightMap.default({}),
});
export type ScoreEffects = z.infer<typeof scoreEffectsSchema>;
export type RawScores = Record<ScoreGroup, Record<string, number>>;

const phrases = z.array(z.string().min(3).max(600)).min(1).max(12);
export const archetypeSchema = z.strictObject({
  id: z.enum(ARCHETYPE_KEYS), slug: z.enum(ARCHETYPE_KEYS), name: z.string().min(2),
  short_description: z.string().min(10), core_desire: z.string().min(5),
  core_fear: z.string().min(5), core_motivation: z.string().min(5),
  strengths: phrases, shadow_traits: phrases, growth_direction: phrases,
  decision_patterns: phrases, relationship_patterns: phrases, leadership_patterns: phrases,
  symbolic_keywords: phrases,
}).refine(x => x.id === x.slug, 'Registry ID and slug must match');
export type Archetype = z.infer<typeof archetypeSchema>;

export const dimensionSchema = z.strictObject({
  group: z.enum(SCORE_GROUPS), key: dimensionKeySchema, label: z.string().min(2),
  description: z.string().min(10),
});
export type PsychologicalDimension = z.infer<typeof dimensionSchema>;

export const choiceSchema = z.strictObject({
  id: z.string().regex(/^scene_\d{2}_choice_[a-d]$/), text: z.string().min(10).max(700),
  male_variant: z.string().min(10).nullable().default(null),
  female_variant: z.string().min(10).nullable().default(null), scores: scoreEffectsSchema,
});
export const sceneSchema = z.strictObject({
  id: z.string().regex(/^scene_\d{2}$/), act: z.number().int().min(1).max(7),
  order: z.number().int().min(1), title: z.string().min(3), narrative: z.string().min(50).max(4000),
  male_variant: z.string().min(50).nullable().default(null),
  female_variant: z.string().min(50).nullable().default(null),
  image_prompt: z.string().nullable().default(null), is_pressure: z.boolean().default(false),
  choices: z.array(choiceSchema).min(3).max(4),
});
export type Scene = z.infer<typeof sceneSchema>;
export const journeyContentSchema = z.strictObject({
  id: z.string().min(3), slug: z.string().min(3), title: z.string().min(3),
  journey_version: z.string().regex(/^\d+\.\d+$/), scoring_version: z.string().regex(/^\d+\.\d+$/),
  archetypes: z.array(archetypeSchema).length(12),
  dimensions: z.array(dimensionSchema).min(30), scenes: z.array(sceneSchema).min(12).max(15),
});
export type JourneyContent = z.infer<typeof journeyContentSchema>;
export const answerSchema = z.strictObject({ scene_id: z.string(), choice_id: z.string() });
export type Answer = z.infer<typeof answerSchema>;
export const userIdentitySchema = z.strictObject({
  name: z.string().trim().min(1).max(60).nullable(), character_gender: z.enum(['man', 'woman']),
});
export type UserIdentity = z.infer<typeof userIdentitySchema>;

export function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
