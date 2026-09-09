import { z } from 'zod';
import type { StructuredProfile } from '../domain/scoring/profile.js';

const text = (max = 1800) => z.string().trim().min(12).max(max).refine(value => !/<\/?[a-z][^>]*>/i.test(value), 'Interpretation must be plain text');
const item = z.strictObject({ title: z.string().min(3).max(100), description: text(700) });
export const interpretationSchema = z.strictObject({
  character_title: z.string().min(5).max(100),
  summary: text(2200).refine(value => { const words = value.split(/\s+/).length; return words >= 100 && words <= 200; }, 'Summary must contain 100–200 words'),
  strengths: z.array(item).min(4).max(6), blind_spots: z.array(item).min(3).max(5),
  decision_style: text(), relationships: text(), motivation_analysis: text(), shadow_analysis: text(),
  growth_path: z.array(item).min(3).max(5), ideal_environment: text(), final_reflection: text(),
  social: z.strictObject({ instagram_caption: text(2000), linkedin_caption: text(2500), x_caption: text(280), quote: text(200) }),
});
export type Interpretation = z.infer<typeof interpretationSchema>;
const forbidden = /\b(?:you (?:are|have) (?:a |an )?(?:narcissis\w*|disorder|psychiatric condition)|you suffer from|attachment trauma|clinical conclusion|scientifically proven|you are the (?:innocent|explorer|sage|hero|outlaw|magician|lover|creator|caregiver|jester|ruler|everyman))\b/i;

export function validateInterpretation(input: unknown, profile: StructuredProfile): Interpretation {
  const result = interpretationSchema.parse(input);
  if (!profile.character.approved_candidates.includes(result.character_title)) throw new Error('AI selected an unapproved character title');
  const strings: string[] = [];
  const collect = (value: unknown): void => {
    if (typeof value === 'string') strings.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(result);
  if (strings.some(value => forbidden.test(value) || /<\/?[a-z][^>]*>/i.test(value))) throw new Error('Interpretation contains prohibited clinical, fixed-identity, or markup language');
  if (profile.archetypes.shadow.evidence !== 'supported' && !/limited|tentative|insufficient|not enough|limitad|insuficiente|no hay suficiente/i.test(result.shadow_analysis)) throw new Error('Shadow interpretation must acknowledge limited evidence');
  return result;
}
