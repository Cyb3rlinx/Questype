import { ARCHETYPE_KEYS, SHADOW_KEYS, deepFreeze, type Answer, type ArchetypeKey, type JourneyContent, type ShadowKey } from '../types.js';
import { validateAnswers } from './engine.js';

interface ShadowRule { affinity: Partial<Record<ShadowKey, number>>; contrast: ArchetypeKey }
export const shadowRulesV1 = deepFreeze({
  innocent: { affinity: { avoidance: 1, control: 0.15 }, contrast: 'outlaw' },
  explorer: { affinity: { avoidance: 0.8, rebellion: 0.4, emotional_detachment: 0.2 }, contrast: 'everyman' },
  sage: { affinity: { emotional_detachment: 1, obsession: 0.65 }, contrast: 'lover' },
  hero: { affinity: { self_sacrifice: 0.65, control: 0.45, rebellion: 0.2 }, contrast: 'innocent' },
  outlaw: { affinity: { rebellion: 1, avoidance: 0.2 }, contrast: 'ruler' },
  magician: { affinity: { control: 0.55, obsession: 0.7 }, contrast: 'everyman' },
  lover: { affinity: { self_sacrifice: 0.6, obsession: 0.55, control: 0.2 }, contrast: 'explorer' },
  creator: { affinity: { obsession: 1, emotional_detachment: 0.25 }, contrast: 'jester' },
  caregiver: { affinity: { self_sacrifice: 1, control: 0.3 }, contrast: 'explorer' },
  jester: { affinity: { avoidance: 0.85, rebellion: 0.35 }, contrast: 'sage' },
  ruler: { affinity: { control: 1, emotional_detachment: 0.3 }, contrast: 'outlaw' },
  everyman: { affinity: { avoidance: 0.55, self_sacrifice: 0.55 }, contrast: 'explorer' },
} satisfies Record<ArchetypeKey, ShadowRule>);
export interface ShadowAxisEvidence { positive: number; pressure: number; hits: number; evidence_score: number; scene_ids: string[]; pressure_scene_ids: string[] }
export interface ShadowResult {
  slug: ArchetypeKey; evidence: 'supported' | 'limited' | 'insufficient'; score: number;
  dominant_axis: ShadowKey | null;
  axes: Record<ShadowKey, ShadowAxisEvidence>;
  candidates: { slug: ArchetypeKey; score: number }[];
}

export function determineShadowArchetype(content: JourneyContent, input: readonly Answer[], calibrated: Record<ArchetypeKey, number>, primary: ArchetypeKey): ShadowResult {
  if (content.scoring_version !== '1.0') throw new Error('Unsupported shadow rules version');
  if (ARCHETYPE_KEYS.some(k => !Number.isFinite(calibrated[k]))) throw new Error('Invalid calibrated scores');
  const answers = validateAnswers(content, input, true);
  const axes = Object.fromEntries(SHADOW_KEYS.map(key => {
    const axis: ShadowAxisEvidence = { positive: 0, pressure: 0, hits: 0, evidence_score: 0, scene_ids: [], pressure_scene_ids: [] };
    answers.forEach((answer, i) => {
      const scene = content.scenes[i]!;
      const weight = Math.max(0, scene.choices.find(c => c.id === answer.choice_id)!.scores.shadow[key] ?? 0);
      if (weight > 0) {
        axis.positive += weight; axis.hits++; axis.scene_ids.push(scene.id);
        if (scene.is_pressure) { axis.pressure += weight; axis.pressure_scene_ids.push(scene.id); }
      }
    });
    axis.evidence_score = (axis.positive + axis.pressure) * Math.min(1, axis.hits / 3);
    return [key, axis];
  })) as Record<ShadowKey, ShadowAxisEvidence>;
  const candidates = ARCHETYPE_KEYS.map(slug => {
    const rule: ShadowRule = shadowRulesV1[slug];
    const base = SHADOW_KEYS.reduce((sum, key) => sum + (rule.affinity[key] ?? 0) * axes[key].evidence_score, 0);
    const contradiction = 0.15 * Math.max(0, calibrated[rule.contrast] - calibrated[slug]);
    return { slug, score: base * (1 + Math.min(0.5, contradiction)) };
  }).sort((a, b) => b.score - a.score || ARCHETYPE_KEYS.indexOf(a.slug) - ARCHETYPE_KEYS.indexOf(b.slug));
  const winner = candidates[0]!;
  if (winner.score === 0) return { slug: primary, score: 0, evidence: 'insufficient', dominant_axis: null, axes, candidates };
  const rule: ShadowRule = shadowRulesV1[winner.slug];
  const relevant = SHADOW_KEYS.filter(key => (rule.affinity[key] ?? 0) > 0 && axes[key].hits > 0);
  const supported = relevant.some(key => axes[key].hits >= 2 && axes[key].pressure_scene_ids.length > 0);
  const dominant = [...relevant].sort((a, b) => axes[b].evidence_score * (rule.affinity[b] ?? 0) - axes[a].evidence_score * (rule.affinity[a] ?? 0) || SHADOW_KEYS.indexOf(a) - SHADOW_KEYS.indexOf(b))[0]!;
  return { slug: winner.slug, score: winner.score, evidence: supported ? 'supported' : 'limited', dominant_axis: dominant, axes, candidates };
}
