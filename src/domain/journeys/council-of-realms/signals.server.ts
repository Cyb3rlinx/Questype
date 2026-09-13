import {
  balancedChoiceEvidence,
  createDraftJourneyServerModel,
  type DraftSignalSlot,
} from '../draft-contracts.js';
import type { JourneySignalModel } from '../../signals/contracts.js';
import { councilOfRealmsContent } from './content.js';

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
      'leadership_initiative',
      'responsibility_assumption',
      'public_visibility',
      'social_strategy',
    ),
    slot(
      'social_confidence',
      'interpersonal_visibility',
      'public_visibility',
      'social_strategy',
    ),
  ],
  [
    slot(
      'empathy_cooperation',
      'perspective_taking',
      'moral_tradeoff',
      'social_strategy',
    ),
    slot('structure', 'prioritization', 'resource_scarcity'),
  ],
  [
    slot('autonomy', 'independent_judgment', 'authority'),
    slot('knowledge_orientation', 'evidence_seeking', 'knowledge_gap'),
  ],
  [
    slot(
      'social_confidence',
      'disagreement_tolerance',
      'interpersonal_conflict',
      'social_strategy',
    ),
    slot(
      'emotional_regulation',
      'composure_under_pressure',
      'interpersonal_conflict',
      'pressure_response',
    ),
  ],
  [
    slot(
      'leadership_initiative',
      'delegation',
      'group_coordination',
      'social_strategy',
    ),
    slot(
      'empathy_cooperation',
      'coalition_building',
      'group_coordination',
      'social_strategy',
    ),
  ],
  [
    slot('structure', 'planning', 'time_pressure', 'pressure_response'),
    slot('adaptability', 'strategy_revision', 'change', 'pressure_response'),
  ],
  [
    slot(
      'empathy_cooperation',
      'coalition_building',
      'negotiation',
      'social_strategy',
    ),
    slot(
      'social_confidence',
      'persuasion_attempt',
      'negotiation',
      'social_strategy',
    ),
  ],
  [
    slot(
      'empathy_cooperation',
      'interpersonal_concern',
      'caregiving',
      'social_strategy',
    ),
    slot('autonomy', 'choice_ownership', 'responsibility'),
  ],
  [
    slot('knowledge_orientation', 'causal_reasoning', 'knowledge_gap'),
    slot('openness_to_uncertainty', 'possibility_holding', 'uncertainty'),
  ],
  [
    slot(
      'leadership_initiative',
      'decisiveness',
      'time_pressure',
      'pressure_response',
    ),
    slot(
      'structure',
      'procedural_thinking',
      'time_pressure',
      'pressure_response',
    ),
  ],
  [
    slot('autonomy', 'choice_ownership', 'responsibility'),
    slot('adaptability', 'feedback_learning', 'change'),
  ],
  [
    slot(
      'emotional_regulation',
      'affect_tolerance',
      'social_risk',
      'pressure_response',
    ),
    slot(
      'persistence',
      'goal_commitment',
      'responsibility',
      'pressure_response',
    ),
  ],
  [
    slot(
      'leadership_initiative',
      'mobilization',
      'time_pressure',
      'pressure_response',
    ),
    slot(
      'emotional_regulation',
      'impulse_regulation',
      'responsibility',
      'pressure_response',
    ),
  ],
  [
    slot(
      'structure',
      'prioritization',
      'resource_scarcity',
      'pressure_response',
    ),
    slot(
      'empathy_cooperation',
      'prosocial_response',
      'moral_tradeoff',
      'social_strategy',
    ),
  ],
  [
    slot(
      'autonomy',
      'social_pressure_resistance',
      'authority',
      'social_strategy',
    ),
    slot(
      'social_confidence',
      'assertive_expression',
      'social_risk',
      'social_strategy',
    ),
  ],
  [
    slot(
      'leadership_initiative',
      'responsibility_assumption',
      'responsibility',
    ),
    slot('autonomy', 'choice_ownership', 'responsibility'),
  ],
  [
    slot(
      'social_confidence',
      'interpersonal_visibility',
      'public_visibility',
      'social_strategy',
    ),
    slot(
      'empathy_cooperation',
      'perspective_taking',
      'moral_tradeoff',
      'social_strategy',
    ),
  ],
  [
    slot('persistence', 'setback_recovery', 'loss'),
    slot('openness_to_uncertainty', 'incomplete_answer_tolerance', 'loss'),
  ],
] as const;

const slots = Object.fromEntries(
  councilOfRealmsContent.scenes.map((scene, index) => [
    scene.id,
    pairs[index]!,
  ]),
);

export const councilOfRealmsSignalModel: JourneySignalModel = {
  id: 'council_realms_signals_0_1',
  schemaVersion: '1.0',
  journeyId: councilOfRealmsContent.id,
  journeyVersion: councilOfRealmsContent.journeyVersion,
  scoringVersion: councilOfRealmsContent.scoringVersion,
  choiceEvidence: balancedChoiceEvidence(councilOfRealmsContent.scenes, slots),
};

export const councilOfRealmsServerModel = createDraftJourneyServerModel(
  councilOfRealmsContent,
  councilOfRealmsSignalModel,
);
