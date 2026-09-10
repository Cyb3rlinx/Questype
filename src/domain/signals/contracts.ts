import { z } from 'zod';

export const SIGNAL_KEYS = [
  'autonomy',
  'structure',
  'risk_tolerance',
  'openness_to_uncertainty',
  'knowledge_orientation',
  'creation_orientation',
  'empathy_cooperation',
  'social_confidence',
  'leadership_initiative',
  'persistence',
  'adaptability',
  'emotional_regulation',
] as const;

export const SIGNAL_CONTEXTS = [
  'uncertainty',
  'time_pressure',
  'physical_risk',
  'social_risk',
  'resource_scarcity',
  'group_coordination',
  'interpersonal_conflict',
  'moral_tradeoff',
  'authority',
  'negotiation',
  'exploration',
  'knowledge_gap',
  'caregiving',
  'loss',
  'change',
  'public_visibility',
  'responsibility',
  'creative_problem_solving',
] as const;

export const EVIDENCE_BANDS = [
  'insufficient',
  'emerging',
  'moderate',
  'strong',
] as const;

export type SignalKey = (typeof SIGNAL_KEYS)[number];
export type SignalContext = (typeof SIGNAL_CONTEXTS)[number];
export type EvidenceBand = (typeof EVIDENCE_BANDS)[number];

export interface SignalDefinition {
  id: SignalKey;
  label: { en: string; es: string };
  definition: { en: string; es: string };
  inclusionCriteria: readonly string[];
  exclusionCriteria: readonly string[];
  facets: readonly { id: string; label: { en: string; es: string } }[];
  allowedContexts: readonly SignalContext[];
  minimumObservations: number;
  minimumContributingObservations: number;
  minimumScenes: number;
  minimumContexts: number;
}

export const signalContributionSchema = z.strictObject({
  signal: z.enum(SIGNAL_KEYS),
  facet: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
  context: z.enum(SIGNAL_CONTEXTS),
  direction: z.union([z.literal(-1), z.literal(1)]),
  weight: z.number().min(0.1).max(1),
  observationType: z
    .enum(['behavioral_choice', 'pressure_response', 'social_strategy'])
    .default('behavioral_choice'),
});
export type SignalContribution = z.infer<typeof signalContributionSchema>;

export const journeySignalModelSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9_]{2,95}$/),
  schemaVersion: z.literal('1.0'),
  journeyId: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
  journeyVersion: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
  scoringVersion: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
  choiceEvidence: z.record(
    z.string().regex(/^[a-z][a-z0-9_-]{2,95}$/),
    z.array(signalContributionSchema).max(5),
  ),
});
export type JourneySignalModel = z.infer<typeof journeySignalModelSchema>;

export interface SignalEvidenceRecord {
  journeyId: string;
  journeyVersion: string;
  scoringVersion: string;
  modelId: string;
  sceneId: string;
  choiceId: string;
  signal: SignalKey;
  facet: string;
  context: SignalContext;
  direction: -1 | 1;
  weight: number;
  signedContribution: number;
  observationType:
    | 'behavioral_choice'
    | 'pressure_response'
    | 'social_strategy';
}

export interface SignalMeasurement {
  signal: SignalKey;
  value: number | null;
  band: EvidenceBand;
  observations: number;
  contributingObservations: number;
  scenes: number;
  contexts: number;
  journeys: number;
  sceneIds: string[];
  contextIds: SignalContext[];
  opportunityCoverage: number;
  directionalConsistency: number;
}

export interface JourneySignalAssessment {
  resultId: string;
  journeyId: string;
  journeyVersion: string;
  scoringVersion: string;
  signalModelId: string;
  signalModelVersion: '1.0';
  decisionsAnalyzed: number;
  signals: Record<SignalKey, SignalMeasurement>;
  evidence: SignalEvidenceRecord[];
  fingerprint: string;
}

export interface AccumulatedSignalProfile {
  aggregationVersion: '1.0';
  sourceResultIds: string[];
  journeysCompleted: number;
  decisionsAnalyzed: number;
  profileDepth: 'initial' | 'emerging' | 'established' | 'extensive';
  signals: Record<SignalKey, SignalMeasurement>;
  fingerprint: string;
}
