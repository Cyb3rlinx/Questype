import { z } from 'zod';
import { SIGNAL_KEYS } from '../signals/contracts.js';

const archetypeResultDescriptorSchema = z.strictObject({
  kind: z.literal('archetype_v1'),
  journeyId: z.literal('journey_unwritten_road'),
  resultId: z.string().min(1),
  contractVersion: z.literal('1.0'),
});

const signalResultDescriptorSchema = z.strictObject({
  kind: z.literal('signals_v1'),
  journeyId: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
  resultId: z.string().min(1),
  contractVersion: z.literal('1.0'),
  signalModelId: z.string().min(3),
});

export const journeyResultDescriptorSchema = z.discriminatedUnion('kind', [
  archetypeResultDescriptorSchema,
  signalResultDescriptorSchema,
]);
export type JourneyResultDescriptor = z.infer<
  typeof journeyResultDescriptorSchema
>;

export const signalJourneyReportSchema = z.strictObject({
  templateVersion: z.literal('questype-journey-signals.v1'),
  locale: z.enum(['en', 'es']),
  resultId: z.string().min(1),
  journeyId: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
  journeyVersion: z.string(),
  scoringVersion: z.string(),
  signalModelId: z.string(),
  generatedAt: z.iso.datetime(),
  title: z.string().min(3),
  assessmentFocus: z.string().min(3),
  decisionsAnalyzed: z.number().int().nonnegative(),
  dimensions: z.array(
    z.strictObject({
      id: z.enum(SIGNAL_KEYS),
      label: z.string(),
      status: z.enum(['measured', 'unexplored']),
      evidenceBand: z.enum(['insufficient', 'emerging', 'moderate', 'strong']),
      pattern: z.string(),
      observations: z.number().int().nonnegative(),
      scenes: z.number().int().nonnegative(),
      contexts: z.array(z.string()),
    }),
  ),
  sections: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z][a-z0-9-]{2,63}$/),
        title: z.string(),
        paragraphs: z.array(z.string()).min(1),
      }),
    )
    .min(6)
    .max(12),
  scopeNote: z.string().min(40),
});
export type SignalJourneyReportData = z.infer<typeof signalJourneyReportSchema>;
