import { z } from 'zod';
import { stableHash } from '../../database/content-hash.js';
import {
  SIGNAL_CONTEXTS,
  SIGNAL_KEYS,
  type JourneySignalModel,
  type SignalContext,
  type SignalKey,
} from '../signals/contracts.js';
import { createSignalEngine, type SignalContent } from '../signals/engine.js';
import type { LocalizedText } from './contracts.js';

const localizedText = z.strictObject({
  en: z.string().min(3).max(1600),
  es: z.string().min(3).max(1600),
});

const choice = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9_-]{2,95}$/),
  text: localizedText,
  benefit: localizedText,
  tradeoff: localizedText,
});

const scene = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9_-]{2,63}$/),
  act: z.number().int().min(1).max(12),
  order: z.number().int().min(1).max(48),
  title: localizedText,
  narrative: localizedText,
  narrativePurpose: localizedText,
  psychologicalPurpose: localizedText,
  primarySignals: z.array(z.enum(SIGNAL_KEYS)).min(1).max(3),
  secondarySignals: z.array(z.enum(SIGNAL_KEYS)).max(3),
  facets: z.array(z.string().regex(/^[a-z][a-z0-9_]{2,63}$/)).min(1),
  contexts: z.array(z.enum(SIGNAL_CONTEXTS)).min(1),
  socialDesirabilityRisk: localizedText,
  constructConfounds: localizedText,
  isPressure: z.boolean(),
  visualConcept: localizedText,
  continuityNotes: localizedText,
  choices: z.array(choice).length(4),
});

export const draftJourneyContentSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
    slug: z.string().regex(/^[a-z][a-z0-9-]{2,79}$/),
    title: localizedText,
    journeyVersion: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
    scoringVersion: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
    acts: z.array(localizedText).min(3).max(12),
    scenes: z.array(scene).length(18),
  })
  .superRefine((content, context) => {
    const sceneIds = new Set<string>();
    const choiceIds = new Set<string>();
    content.scenes.forEach((item, index) => {
      if (item.order !== index + 1)
        context.addIssue({
          code: 'custom',
          path: ['scenes', index, 'order'],
          message: 'Draft scenes must use one fixed sequential order',
        });
      if (item.act > content.acts.length)
        context.addIssue({
          code: 'custom',
          path: ['scenes', index, 'act'],
          message: 'Scene act must exist in the localized act list',
        });
      if (sceneIds.has(item.id))
        context.addIssue({
          code: 'custom',
          path: ['scenes', index, 'id'],
          message: 'Scene IDs must be unique',
        });
      sceneIds.add(item.id);
      for (const itemChoice of item.choices) {
        if (choiceIds.has(itemChoice.id))
          context.addIssue({
            code: 'custom',
            path: ['scenes', index, 'choices'],
            message: 'Choice IDs must be globally unique within a Journey',
          });
        choiceIds.add(itemChoice.id);
      }
    });
  });

export type DraftJourneyContent = z.infer<typeof draftJourneyContentSchema>;
export type DraftJourneyScene = DraftJourneyContent['scenes'][number];

export function localized(en: string, es: string): LocalizedText {
  return { en, es };
}

export interface DraftJourneyServerModel {
  content: DraftJourneyContent;
  signalEngine: ReturnType<typeof createSignalEngine>;
  signalModel: JourneySignalModel;
  contentHash: string;
  resultContract: 'questype-signals.v1';
}

export function parseDraftJourneyContent(input: unknown): DraftJourneyContent {
  return draftJourneyContentSchema.parse(input);
}

export function draftSignalContent(
  content: DraftJourneyContent,
): SignalContent {
  return {
    journey_version: content.journeyVersion,
    scoring_version: content.scoringVersion,
    scenes: content.scenes.map((item) => ({
      id: item.id,
      choices: item.choices.map((itemChoice) => ({ id: itemChoice.id })),
    })),
  };
}

export function createDraftJourneyServerModel(
  content: DraftJourneyContent,
  signalModel: JourneySignalModel,
): DraftJourneyServerModel {
  const signalContent = draftSignalContent(content);
  return {
    content,
    signalModel,
    signalEngine: createSignalEngine(signalContent, signalModel),
    contentHash: stableHash(content),
    resultContract: 'questype-signals.v1',
  };
}

export interface DraftSignalSlot {
  signal: SignalKey;
  facet: string;
  context: SignalContext;
  weight?: number;
  observationType?:
    | 'behavioral_choice'
    | 'pressure_response'
    | 'social_strategy';
}

export function balancedChoiceEvidence(
  scenes: readonly DraftJourneyScene[],
  slots: Readonly<Record<string, readonly [DraftSignalSlot, DraftSignalSlot]>>,
): JourneySignalModel['choiceEvidence'] {
  const evidence: JourneySignalModel['choiceEvidence'] = {};
  for (const item of scenes) {
    const pair = slots[item.id];
    if (!pair) throw new Error(`Missing signal design for ${item.id}`);
    const directions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as const;
    item.choices.forEach((itemChoice, index) => {
      evidence[itemChoice.id] = pair.map((slot, slotIndex) => ({
        signal: slot.signal,
        facet: slot.facet,
        context: slot.context,
        direction: directions[index]![slotIndex]!,
        weight: slot.weight ?? 0.7,
        observationType: slot.observationType ?? 'behavioral_choice',
      }));
    });
  }
  return evidence;
}
