import type {
  JourneySignalModel,
  SignalContext,
  SignalContribution,
  SignalKey,
} from '../../signals/contracts.js';
import { journeySignalModelSchema } from '../../signals/contracts.js';

const choiceEvidence: Record<string, SignalContribution[]> = {};

function add(
  signal: SignalKey,
  facet: string,
  context: SignalContext,
  weight: number,
  choices: readonly string[],
  direction: -1 | 1 = 1,
  observationType: SignalContribution['observationType'] = 'behavioral_choice',
) {
  for (const choice of choices)
    (choiceEvidence[choice] ??= []).push({
      signal,
      facet,
      context,
      weight,
      direction,
      observationType,
    });
}

add('autonomy', 'independent_judgment', 'uncertainty', 0.6, [
  'scene_10_choice_a',
]);
add('autonomy', 'social_pressure_resistance', 'authority', 0.6, [
  'scene_11_choice_b',
  'scene_11_choice_c',
]);
add('autonomy', 'social_pressure_resistance', 'uncertainty', 0.7, [
  'scene_15_choice_b',
  'scene_15_choice_d',
]);

add('structure', 'preparation', 'uncertainty', 0.7, ['scene_01_choice_d']);
add('structure', 'procedural_thinking', 'time_pressure', 0.65, [
  'scene_03_choice_b',
  'scene_03_choice_c',
]);
add('structure', 'organization', 'resource_scarcity', 0.7, [
  'scene_04_choice_a',
  'scene_04_choice_c',
  'scene_06_choice_b',
]);
add('structure', 'organization', 'group_coordination', 0.8, [
  'scene_06_choice_a',
]);
add('structure', 'planning', 'responsibility', 0.7, [
  'scene_08_choice_a',
  'scene_13_choice_c',
]);

add('risk_tolerance', 'calculated_risk', 'physical_risk', 0.8, [
  'scene_03_choice_a',
]);
add('risk_tolerance', 'commitment_under_uncertainty', 'physical_risk', 0.55, [
  'scene_03_choice_d',
  'scene_09_choice_a',
]);
add('risk_tolerance', 'downside_tolerance', 'uncertainty', 0.45, [
  'scene_10_choice_a',
]);

add('openness_to_uncertainty', 'ambiguity_tolerance', 'uncertainty', 0.55, [
  'scene_01_choice_a',
  'scene_01_choice_c',
  'scene_03_choice_d',
  'scene_10_choice_c',
]);
add(
  'openness_to_uncertainty',
  'incomplete_answer_tolerance',
  'knowledge_gap',
  0.75,
  ['scene_02_choice_d'],
);
add('openness_to_uncertainty', 'exploratory_orientation', 'exploration', 0.65, [
  'scene_10_choice_b',
]);
add('openness_to_uncertainty', 'ambiguity_tolerance', 'uncertainty', 0.8, [
  'scene_15_choice_a',
  'scene_15_choice_d',
]);
add(
  'openness_to_uncertainty',
  'ambiguity_tolerance',
  'uncertainty',
  0.45,
  ['scene_15_choice_b'],
  -1,
);

add('knowledge_orientation', 'evidence_seeking', 'knowledge_gap', 0.8, [
  'scene_02_choice_b',
  'scene_04_choice_b',
  'scene_05_choice_a',
  'scene_07_choice_b',
]);
add(
  'knowledge_orientation',
  'information_prioritization',
  'exploration',
  0.65,
  ['scene_02_choice_a', 'scene_08_choice_b', 'scene_14_choice_b'],
);
add('knowledge_orientation', 'investigation', 'knowledge_gap', 0.6, [
  'scene_14_choice_d',
]);
add('knowledge_orientation', 'evidence_seeking', 'negotiation', 0.65, [
  'scene_11_choice_b',
]);
add('knowledge_orientation', 'reflective_analysis', 'uncertainty', 0.8, [
  'scene_15_choice_c',
]);

add('creation_orientation', 'making', 'creative_problem_solving', 0.8, [
  'scene_03_choice_c',
  'scene_05_choice_c',
  'scene_06_choice_b',
  'scene_07_choice_c',
]);
add(
  'creation_orientation',
  'experimentation',
  'creative_problem_solving',
  0.65,
  ['scene_06_choice_c'],
);
add('creation_orientation', 'ideation', 'uncertainty', 0.45, [
  'scene_10_choice_c',
  'scene_15_choice_d',
]);
add(
  'creation_orientation',
  'constructive_improvisation',
  'creative_problem_solving',
  0.9,
  ['scene_13_choice_b', 'scene_13_choice_d'],
);
add('creation_orientation', 'design', 'change', 0.65, [
  'scene_14_choice_a',
  'scene_14_choice_b',
  'scene_14_choice_d',
]);

add('empathy_cooperation', 'perspective_taking', 'negotiation', 0.8, [
  'scene_02_choice_c',
]);
add('empathy_cooperation', 'prosocial_response', 'caregiving', 0.8, [
  'scene_04_choice_d',
  'scene_07_choice_a',
  'scene_07_choice_d',
  'scene_08_choice_c',
  'scene_09_choice_a',
  'scene_09_choice_c',
  'scene_10_choice_d',
  'scene_14_choice_c',
]);
add(
  'empathy_cooperation',
  'perspective_taking',
  'interpersonal_conflict',
  0.75,
  ['scene_05_choice_b', 'scene_12_choice_c'],
);
add('empathy_cooperation', 'coalition_building', 'group_coordination', 0.65, [
  'scene_05_choice_d',
  'scene_06_choice_c',
  'scene_08_choice_d',
  'scene_09_choice_d',
  'scene_11_choice_d',
  'scene_12_choice_a',
  'scene_12_choice_d',
  'scene_14_choice_a',
]);

add('social_confidence', 'assertive_expression', 'social_risk', 0.6, [
  'scene_05_choice_b',
  'scene_12_choice_c',
  'scene_14_choice_c',
]);
add(
  'social_confidence',
  'interpersonal_visibility',
  'public_visibility',
  0.65,
  [
    'scene_05_choice_d',
    'scene_12_choice_a',
    'scene_12_choice_d',
    'scene_14_choice_a',
  ],
);
add('social_confidence', 'persuasion_attempt', 'group_coordination', 0.55, [
  'scene_08_choice_d',
  'scene_11_choice_d',
]);

add(
  'leadership_initiative',
  'responsibility_assumption',
  'responsibility',
  0.75,
  ['scene_13_choice_c'],
  1,
  'social_strategy',
);
add(
  'leadership_initiative',
  'coordination',
  'group_coordination',
  0.85,
  ['scene_06_choice_a', 'scene_06_choice_d', 'scene_09_choice_d'],
  1,
  'social_strategy',
);
add(
  'leadership_initiative',
  'decisiveness',
  'time_pressure',
  0.8,
  ['scene_09_choice_b'],
  1,
  'pressure_response',
);
add('persistence', 'sustained_effort', 'physical_risk', 0.65, [
  'scene_09_choice_a',
  'scene_13_choice_a',
]);
add('persistence', 'frustration_tolerance', 'resource_scarcity', 0.7, [
  'scene_13_choice_d',
]);
add('persistence', 'sustained_effort', 'time_pressure', 0.6, [
  'scene_09_choice_d',
]);
add('adaptability', 'strategy_revision', 'creative_problem_solving', 0.75, [
  'scene_06_choice_c',
  'scene_13_choice_d',
]);
add('adaptability', 'resource_reallocation', 'resource_scarcity', 0.85, [
  'scene_06_choice_d',
  'scene_13_choice_b',
]);
add('adaptability', 'feedback_learning', 'change', 0.55, ['scene_14_choice_b']);

add(
  'emotional_regulation',
  'composure_under_pressure',
  'time_pressure',
  0.65,
  [
    'scene_04_choice_a',
    'scene_04_choice_d',
    'scene_09_choice_b',
    'scene_09_choice_c',
  ],
  1,
  'pressure_response',
);
add(
  'emotional_regulation',
  'impulse_regulation',
  'physical_risk',
  0.7,
  ['scene_07_choice_a', 'scene_07_choice_d'],
  1,
  'pressure_response',
);
add(
  'emotional_regulation',
  'emotional_awareness',
  'uncertainty',
  0.85,
  ['scene_15_choice_b', 'scene_15_choice_d'],
  1,
  'pressure_response',
);

export const unwrittenRoadSignalModel: JourneySignalModel =
  journeySignalModelSchema.parse({
    id: 'unwritten_road_signals_1_0',
    schemaVersion: '1.0',
    journeyId: 'journey_unwritten_road',
    journeyVersion: '1.1',
    scoringVersion: '1.1',
    choiceEvidence,
  });
