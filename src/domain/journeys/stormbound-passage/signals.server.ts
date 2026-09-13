import {
  balancedChoiceEvidence,
  createDraftJourneyServerModel,
  type DraftSignalSlot,
} from '../draft-contracts.js';
import type { JourneySignalModel } from '../../signals/contracts.js';
import { stormboundPassageContent } from './content.js';

const slot = (
  signal: DraftSignalSlot['signal'],
  facet: string,
  context: DraftSignalSlot['context'],
  observationType: DraftSignalSlot['observationType'] = 'behavioral_choice',
): DraftSignalSlot => ({
  signal,
  facet,
  context,
  weight: 0.7,
  observationType,
});

const pairs = [
  [
    slot(
      'risk_tolerance',
      'calculated_risk',
      'physical_risk',
      'pressure_response',
    ),
    slot('openness_to_uncertainty', 'ambiguity_tolerance', 'uncertainty'),
  ],
  [
    slot('structure', 'preparation', 'uncertainty'),
    slot(
      'knowledge_orientation',
      'information_prioritization',
      'knowledge_gap',
    ),
  ],
  [
    slot('autonomy', 'independent_judgment', 'uncertainty'),
    slot(
      'emotional_regulation',
      'emotional_awareness',
      'social_risk',
      'pressure_response',
    ),
  ],
  [
    slot('adaptability', 'strategy_revision', 'change', 'pressure_response'),
    slot(
      'persistence',
      'goal_commitment',
      'physical_risk',
      'pressure_response',
    ),
  ],
  [
    slot(
      'risk_tolerance',
      'downside_tolerance',
      'physical_risk',
      'pressure_response',
    ),
    slot('structure', 'planning', 'time_pressure', 'pressure_response'),
  ],
  [
    slot(
      'emotional_regulation',
      'affect_tolerance',
      'time_pressure',
      'pressure_response',
    ),
    slot(
      'empathy_cooperation',
      'prosocial_response',
      'caregiving',
      'social_strategy',
    ),
  ],
  [
    slot('structure', 'organization', 'uncertainty'),
    slot('adaptability', 'contextual_switching', 'change'),
  ],
  [
    slot(
      'persistence',
      'frustration_tolerance',
      'physical_risk',
      'pressure_response',
    ),
    slot(
      'emotional_regulation',
      'impulse_regulation',
      'time_pressure',
      'pressure_response',
    ),
  ],
  [
    slot(
      'empathy_cooperation',
      'perspective_taking',
      'group_coordination',
      'social_strategy',
    ),
    slot(
      'leadership_initiative',
      'coordination',
      'resource_scarcity',
      'social_strategy',
    ),
  ],
  [
    slot(
      'risk_tolerance',
      'commitment_under_uncertainty',
      'uncertainty',
      'pressure_response',
    ),
    slot('autonomy', 'self_directed_action', 'exploration'),
  ],
  [
    slot(
      'adaptability',
      'resource_reallocation',
      'change',
      'pressure_response',
    ),
    slot(
      'leadership_initiative',
      'delegation',
      'time_pressure',
      'pressure_response',
    ),
  ],
  [
    slot(
      'emotional_regulation',
      'composure_under_pressure',
      'interpersonal_conflict',
      'pressure_response',
    ),
    slot(
      'social_confidence',
      'disagreement_tolerance',
      'interpersonal_conflict',
      'social_strategy',
    ),
  ],
  [
    slot('persistence', 'sustained_effort', 'responsibility'),
    slot('adaptability', 'feedback_learning', 'change'),
  ],
  [
    slot(
      'risk_tolerance',
      'calculated_risk',
      'physical_risk',
      'pressure_response',
    ),
    slot(
      'empathy_cooperation',
      'interpersonal_concern',
      'caregiving',
      'social_strategy',
    ),
  ],
  [
    slot('structure', 'prioritization', 'time_pressure', 'pressure_response'),
    slot('openness_to_uncertainty', 'possibility_holding', 'uncertainty'),
  ],
  [
    slot(
      'leadership_initiative',
      'mobilization',
      'responsibility',
      'pressure_response',
    ),
    slot(
      'emotional_regulation',
      'recovery',
      'time_pressure',
      'pressure_response',
    ),
  ],
  [
    slot(
      'risk_tolerance',
      'commitment_under_uncertainty',
      'physical_risk',
      'pressure_response',
    ),
    slot(
      'persistence',
      'goal_commitment',
      'time_pressure',
      'pressure_response',
    ),
  ],
  [
    slot('knowledge_orientation', 'reflective_analysis', 'knowledge_gap'),
    slot('openness_to_uncertainty', 'incomplete_answer_tolerance', 'loss'),
  ],
] as const;

const slots = Object.fromEntries(
  stormboundPassageContent.scenes.map((scene, index) => [
    scene.id,
    pairs[index]!,
  ]),
);

export const stormboundPassageSignalModel: JourneySignalModel = {
  id: 'stormbound_passage_signals_0_1',
  schemaVersion: '1.0',
  journeyId: stormboundPassageContent.id,
  journeyVersion: stormboundPassageContent.journeyVersion,
  scoringVersion: stormboundPassageContent.scoringVersion,
  choiceEvidence: balancedChoiceEvidence(
    stormboundPassageContent.scenes,
    slots,
  ),
};

export const stormboundPassageServerModel = createDraftJourneyServerModel(
  stormboundPassageContent,
  stormboundPassageSignalModel,
);
