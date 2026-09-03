import { ARCHETYPE_KEYS, MOTIVATION_KEYS, DECISION_KEYS, SHADOW_KEYS, SCORE_GROUPS, journeyContentSchema, type JourneyContent } from '../types.js';

export interface ContentAudit { errors: string[]; warnings: string[] }
export function validateContent(input: unknown): ContentAudit {
  const parsed = journeyContentSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`), warnings: [] };
  const content = parsed.data;
  const errors: string[] = [];
  const warnings: string[] = [];
  const expectUnique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) errors.push(`Duplicate ${label}`);
  };
  expectUnique(content.archetypes.map(a => a.slug), 'archetype');
  if (content.archetypes.map(a => a.slug).join(',') !== ARCHETYPE_KEYS.join(',')) errors.push('Archetypes must use the canonical tie order');
  expectUnique(content.dimensions.map(d => `${d.group}:${d.key}`), 'dimension');
  const known = Object.fromEntries(SCORE_GROUPS.map(g => [g, new Set(content.dimensions.filter(d => d.group === g).map(d => d.key))])) as Record<typeof SCORE_GROUPS[number], Set<string>>;
  for (const [g, keys] of [['archetypes', ARCHETYPE_KEYS], ['motivations', MOTIVATION_KEYS], ['decision_styles', DECISION_KEYS], ['shadow', SHADOW_KEYS]] as const) {
    if (keys.length !== known[g].size || keys.some(k => !known[g].has(k))) errors.push(`Incorrect ${g} dimension registry`);
  }
  expectUnique(content.scenes.map(s => s.id), 'scene');
  expectUnique(content.scenes.flatMap(s => s.choices.map(c => c.id)), 'choice ID');
  if (content.scenes.length !== 15) errors.push('Journey v1 requires exactly 15 scenes');
  if (new Set(content.scenes.map(s => s.act)).size !== 7) errors.push('Journey v1 requires all seven acts');
  content.scenes.forEach((s, index) => {
    if (s.order !== index + 1 || s.id !== `scene_${String(index + 1).padStart(2, '0')}`) errors.push(`Invalid scene order/ID: ${s.id}`);
    if (index && s.act < content.scenes[index - 1]!.act) errors.push(`Act moves backwards: ${s.id}`);
    const mass: Record<string, number> = {};
    let totalMass = 0;
    s.choices.forEach((c, choiceIndex) => {
      if (c.id !== `${s.id}_choice_${'abcd'[choiceIndex]}`) errors.push(`Choice ID does not match scene/order: ${c.id}`);
      let effectCount = 0;
      let absoluteMass = 0;
      for (const g of SCORE_GROUPS) {
        for (const [k, value] of Object.entries(c.scores[g])) {
          if (!known[g].has(k)) errors.push(`Unknown dimension ${g}:${k} in ${c.id}`);
          if (value !== 0) effectCount++;
          absoluteMass += Math.abs(value);
          if (g === 'archetypes' && value > 0) { mass[k] = (mass[k] ?? 0) + value; totalMass += value; }
        }
      }
      if (effectCount === 0) errors.push(`Choice has no effects: ${c.id}`);
      const archetypeCount = Object.values(c.scores.archetypes).filter(v => v !== 0).length;
      if (archetypeCount < 1 || archetypeCount > 3) warnings.push(`Unusual archetype signal count ${archetypeCount}: ${c.id}`);
      if (absoluteMass > 18) warnings.push(`Excessive absolute signal mass ${absoluteMass}: ${c.id}`);
    });
    for (const [key, value] of Object.entries(mass)) if (totalMass && value / totalMass > 0.55) warnings.push(`${s.id} dominated by ${key}`);
  });
  for (const key of ARCHETYPE_KEYS) {
    const varies = content.scenes.some(s => new Set(s.choices.map(c => c.scores.archetypes[key] ?? 0)).size > 1);
    if (!varies) errors.push(`Archetype has no attainable variation: ${key}`);
  }
  return { errors, warnings };
}

export function assertValidContent(content: JourneyContent): void {
  const audit = validateContent(content);
  if (audit.errors.length) throw new Error(`Invalid content:\n${audit.errors.join('\n')}`);
}
