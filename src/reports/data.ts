import { z } from 'zod';
import { structuredProfileSchema, type StructuredProfile } from '../domain/scoring/profile.js';
import { validateInterpretation, type Interpretation } from '../ai/contracts.js';

export const DISCLAIMER = 'This experience is designed for self-reflection and entertainment. It does not provide psychological or medical diagnosis.';
export const REPORT_SECTION_TITLES = [
  'Your Main Result', 'Your Dominant Archetypes', 'Your Shadow Energy', 'How You Face Challenges',
  'How You Make Decisions', 'What Motivates You', 'How You Connect With Others', 'Natural Strengths',
  'Patterns To Watch', 'Your Ideal Environment', 'Your Path of Evolution', 'Final Reflection',
] as const;
export const reportSchema = z.strictObject({
  template_version: z.literal('report.v1'), result_id: z.uuid(),
  cover: z.strictObject({ user_name: z.string().nullable(), character_title: z.string(), character_image_url: z.url().nullable(), date: z.iso.datetime(), branding: z.string() }),
  sections: z.array(z.strictObject({ number: z.number().int().min(1).max(12), title: z.enum(REPORT_SECTION_TITLES), paragraphs: z.array(z.string()).min(1) })).length(12),
  disclaimer: z.literal(DISCLAIMER),
});
export type ReportData = z.infer<typeof reportSchema>;

/** Typed report content only. PDF layout/rendering is Phase 7. */
export function generateReportData(inputProfile: StructuredProfile, inputInterpretation: Interpretation, imageUrl: string | null = null): ReportData {
  const profile = structuredProfileSchema.parse(inputProfile);
  const interpretation = validateInterpretation(inputInterpretation, profile);
  const contents: string[][] = [
    [interpretation.summary],
    profile.archetypes.all.map(a => `${a.name}: ${a.normalized_percentage}% narrative alignment`),
    [interpretation.shadow_analysis],
    [interpretation.decision_style, 'Consider the situation, your resources and the cost of each available strategy before deciding which pattern serves you here.'],
    [interpretation.decision_style],
    [interpretation.motivation_analysis, ...Object.entries(profile.motivations).map(([key, value]) => `${key}: ${value}/100 content-relative index`)],
    [interpretation.relationships],
    interpretation.strengths.map(item => `${item.title}: ${item.description}`),
    interpretation.blind_spots.map(item => `${item.title}: ${item.description}`),
    [interpretation.ideal_environment],
    interpretation.growth_path.map(item => `${item.title}: ${item.description}`),
    [interpretation.final_reflection],
  ];
  return reportSchema.parse({ template_version: 'report.v1', result_id: profile.id,
    cover: { user_name: profile.user.name, character_title: interpretation.character_title, character_image_url: imageUrl, date: profile.created_at, branding: 'The Unwritten Road' },
    sections: REPORT_SECTION_TITLES.map((title, i) => ({ number: i + 1, title, paragraphs: contents[i]! })), disclaimer: DISCLAIMER,
  });
}
