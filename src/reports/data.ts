import { z } from 'zod';
import { structuredProfileSchema, type StructuredProfile } from '../domain/scoring/profile.js';
import { validateInterpretation, type Interpretation } from '../ai/contracts.js';
import type { Locale } from '../i18n/locale.js';
import { archetypeName, localizedCharacterTitle } from '../i18n/archetypes.js';
import { archetypeResultCopy } from '../i18n/result-copy.js';

export const DISCLAIMER = 'This experience is designed for self-reflection and entertainment. It does not provide psychological or medical diagnosis.';
export const REPORT_SECTION_TITLES = [
  'Your Main Result', 'Your Dominant Archetypes', 'Your Shadow Energy', 'How You Face Challenges',
  'How You Make Decisions', 'What Motivates You', 'How You Connect With Others', 'Natural Strengths',
  'Patterns To Watch', 'Your Ideal Environment', 'Your Path of Evolution', 'Final Reflection',
] as const;
export const REPORT_SECTION_TITLES_ES = [
  'Tu resultado principal', 'Tus arquetipos dominantes', 'Tu energía de sombra', 'Cómo enfrentas los desafíos',
  'Cómo tomas decisiones', 'Qué te motiva', 'Cómo conectas con los demás', 'Fortalezas naturales',
  'Patrones para observar', 'Tu entorno ideal', 'Tu camino de evolución', 'Reflexión final',
] as const;
export const DISCLAIMER_ES = 'Esta experiencia está diseñada para la reflexión personal y el entretenimiento. No ofrece un diagnóstico psicológico ni médico.';
export const reportSchema = z.strictObject({
  template_version: z.literal('report.v1'), result_id: z.uuid(),
  locale: z.enum(['en', 'es']),
  cover: z.strictObject({ user_name: z.string().nullable(), character_title: z.string(), character_image_url: z.url().nullable(), date: z.iso.datetime(), branding: z.string() }),
  sections: z.array(z.strictObject({ number: z.number().int().min(1).max(12), title: z.string(), paragraphs: z.array(z.string()).min(1) })).length(12),
  disclaimer: z.string(),
});
export type ReportData = z.infer<typeof reportSchema>;

/** Typed report content only. PDF layout/rendering is Phase 7. */
export function generateReportData(inputProfile: StructuredProfile, inputInterpretation: Interpretation, imageUrl: string | null = null, locale: Locale = 'en'): ReportData {
  const profile = structuredProfileSchema.parse(inputProfile);
  const interpretation = validateInterpretation(inputInterpretation, profile);
  const resultCopy = archetypeResultCopy(profile.archetypes.primary.slug, locale);
  const labels: Record<string, string> = { power: 'Influencia', freedom: 'Libertad', connection: 'Conexión', creation: 'Creación', knowledge: 'Conocimiento', protection: 'Protección' };
  const contents: string[][] = [
    [resultCopy.threadLead, resultCopy.threadBody],
    profile.archetypes.all.map(a => locale === 'es' ? `${archetypeName(a.slug, a.name, locale)}: ${a.normalized_percentage}% de afinidad narrativa` : `${a.name}: ${a.normalized_percentage}% narrative alignment`),
    [interpretation.shadow_analysis],
    [interpretation.decision_style, locale === 'es' ? 'Considera la situación, tus recursos y el costo de cada estrategia disponible antes de decidir qué patrón te sirve en este momento.' : 'Consider the situation, your resources and the cost of each available strategy before deciding which pattern serves you here.'],
    [interpretation.decision_style],
    [interpretation.motivation_analysis, ...Object.entries(profile.motivations).map(([key, value]) => locale === 'es' ? `${labels[key] ?? key}: ${value}/100, índice relativo al contenido` : `${key}: ${value}/100 content-relative index`)],
    [interpretation.relationships],
    interpretation.strengths.map((item, index) => `${resultCopy.strengthTitles[index] ?? item.title}: ${item.description}`),
    interpretation.blind_spots.map(item => `${item.title}: ${item.description}`),
    [interpretation.ideal_environment],
    interpretation.growth_path.map(item => `${item.title}: ${item.description}`),
    [interpretation.final_reflection],
  ];
  const titles = locale === 'es' ? REPORT_SECTION_TITLES_ES : REPORT_SECTION_TITLES;
  return reportSchema.parse({ template_version: 'report.v1', result_id: profile.id, locale,
    cover: { user_name: profile.user.name, character_title: localizedCharacterTitle(profile, locale), character_image_url: imageUrl, date: profile.created_at, branding: locale === 'es' ? 'Questype · El camino no escrito' : 'Questype · The Unwritten Road' },
    sections: titles.map((title, i) => ({ number: i + 1, title, paragraphs: contents[i]! })), disclaimer: locale === 'es' ? DISCLAIMER_ES : DISCLAIMER,
  });
}
