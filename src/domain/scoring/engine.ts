import { ARCHETYPE_KEYS, SCORE_GROUPS, answerSchema, deepFreeze, journeyContentSchema, type Answer, type ArchetypeKey, type JourneyContent, type RawScores, type ScoreGroup, type Scene } from '../types.js';
import { assertValidContent } from '../content/validate.js';

export interface Calibration { mean: number; variance: number; lower: number; upper: number }
export type CalibrationMap = Record<ScoreGroup, Record<string, Calibration>>;
export interface DimensionResult { raw_score: number; normalized_value: number; lower_bound: number; upper_bound: number; has_evidence: boolean; positive_observations: number }
export interface ArchetypeResult { slug: ArchetypeKey; name: string; raw_score: number; calibrated_score: number; proportion: number; normalized_percentage: number }

export function validateAnswers(content: JourneyContent, input: readonly Answer[], requireComplete = false): Answer[] {
  const answers = input.map(answer => answerSchema.parse(answer));
  if (answers.length > content.scenes.length || (requireComplete && answers.length !== content.scenes.length)) throw new Error('Answer count does not match journey completion');
  answers.forEach((a, i) => {
    const scene = content.scenes[i]!;
    if (a.scene_id !== scene.id) throw new Error(`Answers must be a unique ordered prefix; expected ${scene.id}`);
    if (!scene.choices.some(c => c.id === a.choice_id)) throw new Error(`Unknown choice for ${scene.id}`);
  });
  return answers;
}

export function calculateScores(content: JourneyContent, input: readonly Answer[]): RawScores {
  const answers = validateAnswers(content, input);
  const totals = Object.fromEntries(SCORE_GROUPS.map(g => [g, Object.fromEntries(content.dimensions.filter(d => d.group === g).map(d => [d.key, 0]))])) as RawScores;
  answers.forEach((a, index) => {
    const choice = content.scenes[index]!.choices.find(c => c.id === a.choice_id)!;
    for (const g of SCORE_GROUPS) for (const [key, value] of Object.entries(choice.scores[g])) {
      if (!Object.hasOwn(totals[g], key)) throw new Error(`Unregistered dimension: ${g}:${key}`);
      if (!Number.isInteger(value) || Math.abs(value) > 3) throw new Error('Invalid score effect');
      totals[g][key] = totals[g][key]! + value;
    }
  });
  return totals;
}

export function calculateCalibration(content: JourneyContent, scenes: readonly Scene[] = content.scenes): CalibrationMap {
  return Object.fromEntries(SCORE_GROUPS.map(g => [g, Object.fromEntries(content.dimensions.filter(d => d.group === g).map(d => {
    const result: Calibration = { mean: 0, variance: 0, lower: 0, upper: 0 };
    for (const scene of scenes) {
      const weights = scene.choices.map(c => c.scores[g][d.key] ?? 0);
      const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
      result.mean += mean;
      result.variance += weights.reduce((sum, v) => sum + (v - mean) ** 2, 0) / weights.length;
      result.lower += Math.min(...weights);
      result.upper += Math.max(...weights);
    }
    return [d.key, result];
  }))])) as CalibrationMap;
}

/** Whole-percent largest remainder allocation. Ranking always uses unrounded scores. */
export function normalizeArchetypes(scores: Record<ArchetypeKey, number>, temperature = 1): { percentages: Record<ArchetypeKey, number>; proportions: Record<ArchetypeKey, number> } {
  if (!Number.isFinite(temperature) || temperature <= 0) throw new Error('Temperature must be finite and positive');
  if (Object.keys(scores).length !== ARCHETYPE_KEYS.length || ARCHETYPE_KEYS.some(key => !Number.isFinite(scores[key]))) throw new Error('Expected exactly twelve finite archetype scores');
  const max = Math.max(...ARCHETYPE_KEYS.map(key => scores[key]));
  const weights = ARCHETYPE_KEYS.map(key => Math.exp((scores[key] - max) / temperature));
  const sum = weights.reduce((a, b) => a + b, 0);
  const shares = weights.map(w => w / sum);
  const units = shares.map(v => Math.floor(v * 100));
  const remaining = 100 - units.reduce((a, b) => a + b, 0);
  const order = shares.map((v, i) => ({ i, remainder: v * 100 - units[i]! })).sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  for (let i = 0; i < remaining; i++) units[order[i]!.i]!++;
  return {
    percentages: Object.fromEntries(ARCHETYPE_KEYS.map((key, i) => [key, units[i]!])) as Record<ArchetypeKey, number>,
    proportions: Object.fromEntries(ARCHETYPE_KEYS.map((key, i) => [key, shares[i]!])) as Record<ArchetypeKey, number>,
  };
}

export function rankArchetypes(scores: readonly ArchetypeResult[]): ArchetypeResult[] {
  return [...scores].sort((a, b) => b.calibrated_score - a.calibrated_score || ARCHETYPE_KEYS.indexOf(a.slug) - ARCHETYPE_KEYS.indexOf(b.slug));
}

export function calculateDimensionProfile(content: JourneyContent, raw: RawScores, calibration: CalibrationMap, answers: readonly Answer[], group: Exclude<ScoreGroup, 'archetypes'>): Record<string, DimensionResult> {
  return Object.fromEntries(content.dimensions.filter(d => d.group === group).map(d => {
    const bounds = calibration[group][d.key]!;
    const value = raw[group][d.key]!;
    const hasEvidence = bounds.upper > bounds.lower;
    const hits = answers.filter((a, i) => (content.scenes[i]!.choices.find(c => c.id === a.choice_id)!.scores[group][d.key] ?? 0) > 0).length;
    return [d.key, { raw_score: value, normalized_value: hasEvidence ? Math.max(0, Math.min(100, Math.round(100 * (value - bounds.lower) / (bounds.upper - bounds.lower)))) : 0, lower_bound: bounds.lower, upper_bound: bounds.upper, has_evidence: hasEvidence, positive_observations: hits }];
  }));
}
export const calculateMotivationProfile = (content: JourneyContent, raw: RawScores, calibration: CalibrationMap, answers: readonly Answer[]) => calculateDimensionProfile(content, raw, calibration, answers, 'motivations');
export const calculateDecisionStyle = (content: JourneyContent, raw: RawScores, calibration: CalibrationMap, answers: readonly Answer[]) => calculateDimensionProfile(content, raw, calibration, answers, 'decision_styles');
export const calculateShadowProfile = (content: JourneyContent, raw: RawScores, calibration: CalibrationMap, answers: readonly Answer[]) => calculateDimensionProfile(content, raw, calibration, answers, 'shadow');

export function createScoringEngine(input: JourneyContent) {
  // Own a validated immutable snapshot; caller mutations cannot change calibration mid-session.
  assertValidContent(input);
  const content = deepFreeze(journeyContentSchema.parse(input));
  if (content.scoring_version !== '1.0') throw new Error(`Unsupported scoring version: ${content.scoring_version}`);
  const calibration = deepFreeze(calculateCalibration(content));
  for (const key of ARCHETYPE_KEYS) if (calibration.archetypes[key]!.variance <= 0) throw new Error(`No scoring variance for ${key}`);
  return {
    content, calibration,
    evaluate(inputAnswers: readonly Answer[]) {
      const answers = validateAnswers(content, inputAnswers, true);
      const raw = calculateScores(content, answers);
      const calibrated = Object.fromEntries(ARCHETYPE_KEYS.map(key => {
        const base = calibration.archetypes[key]!;
        return [key, (raw.archetypes[key]! - base.mean) / Math.sqrt(base.variance)];
      })) as Record<ArchetypeKey, number>;
      const normalized = normalizeArchetypes(calibrated);
      const all = rankArchetypes(content.archetypes.map(a => ({ slug: a.slug, name: a.name, raw_score: raw.archetypes[a.slug]!, calibrated_score: calibrated[a.slug], proportion: normalized.proportions[a.slug], normalized_percentage: normalized.percentages[a.slug] })));
      return { answers, raw, calibrated, all, primary: all[0]!, secondary: all[1]!, tertiary: all[2]!, tied_primary: all.filter(a => a.calibrated_score === all[0]!.calibrated_score).map(a => a.slug) };
    },
  };
}
export type ScoringEngine = ReturnType<typeof createScoringEngine>;
