import { archetypes } from './archetypes.js';
import { deepFreeze, dimensionSchema, type PsychologicalDimension, type ScoreGroup } from '../types.js';

const group = (kind: ScoreGroup, rows: [string, string, string][]): PsychologicalDimension[] => rows.map(([key, label, description]) => ({ group: kind, key, label, description }));
export const dimensions = deepFreeze([
  ...archetypes.map(a => ({ group: 'archetypes' as const, key: a.slug, label: a.name, description: a.short_description })),
  ...group('motivations', [
    ['power', 'Influence', 'Interest in shaping shared conditions and consequential decisions.'],
    ['freedom', 'Freedom', 'Interest in autonomy, open possibilities and self-directed movement.'],
    ['connection', 'Connection', 'Interest in belonging, intimacy and meaningful shared experience.'],
    ['creation', 'Creation', 'Interest in making, expressing and bringing possibilities into form.'],
    ['knowledge', 'Knowledge', 'Interest in understanding, investigating and sharing useful insight.'],
    ['protection', 'Protection', 'Interest in sustaining safety, care and continuity.'],
  ]),
  ...group('decision_styles', [
    ['impulsive', 'Immediate action', 'Readiness to act before extensive deliberation when an opening appears.'],
    ['strategic', 'Strategic', 'Attention to sequencing, resources and longer-term consequences.'],
    ['intuitive', 'Intuitive', 'Use of emerging patterns and felt possibilities to choose a direction.'],
    ['rational', 'Analytical', 'Use of explicit evidence and reasoning to evaluate alternatives.'],
    ['protective', 'Protective', 'Attention to vulnerability, continuity and who carries a cost.'],
    ['dominant', 'Directive', 'Willingness to set direction and take responsibility for group decisions.'],
  ]),
  ...group('shadow', [
    ['control', 'Tightening control', 'Under pressure, narrowing who can decide or how a task can be done.'],
    ['avoidance', 'Stepping away', 'Under pressure, creating distance from a difficult situation or commitment.'],
    ['self_sacrifice', 'Carrying too much', 'Under pressure, taking on costs without enough attention to personal capacity.'],
    ['rebellion', 'Reflexive resistance', 'Under pressure, opposing a limit before considering its purpose.'],
    ['obsession', 'Holding too tightly', 'Under pressure, staying with an idea or task beyond its current usefulness.'],
    ['emotional_detachment', 'Emotional distance', 'Under pressure, relying on distance or analysis when connection may also matter.'],
  ]),
  ...group('traits', [
    ['risk_tolerance', 'Risk tolerance', 'Willingness to accept uncertain costs when acting.'],
    ['autonomy', 'Autonomy', 'Preference for retaining space for independent judgment.'],
    ['curiosity', 'Curiosity', 'Interest in investigating unfamiliar details and possibilities.'],
    ['empathy', 'Empathy', 'Attention to another person’s experience and needs.'],
    ['social_trust', 'Social trust', 'Willingness to begin cooperation without complete reassurance.'],
    ['persistence', 'Persistence', 'Willingness to continue a meaningful task through difficulty.'],
  ]),
].map(value => dimensionSchema.parse(value)));
