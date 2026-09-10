import type { SignalDefinition, SignalKey } from './contracts.js';
import { SIGNAL_KEYS } from './contracts.js';

const commonMinimum = {
  minimumObservations: 2,
  minimumContributingObservations: 2,
  minimumScenes: 2,
  minimumContexts: 1,
};

export const signalDefinitions: readonly SignalDefinition[] = [
  {
    id: 'autonomy',
    label: { en: 'Autonomy', es: 'Autonomía' },
    definition: {
      en: 'Tendency to preserve independent judgment and act from internally endorsed reasoning rather than defaulting to external pressure.',
      es: 'Tendencia a conservar el juicio propio y actuar desde razones asumidas internamente, en lugar de ceder por defecto a la presión externa.',
    },
    inclusionCriteria: [
      'independent judgment',
      'self-directed action',
      'ownership of choices',
    ],
    exclusionCriteria: [
      'isolation',
      'stubbornness',
      'rejection of collaboration',
    ],
    facets: [
      {
        id: 'independent_judgment',
        label: { en: 'Independent judgment', es: 'Juicio independiente' },
      },
      {
        id: 'social_pressure_resistance',
        label: { en: 'Pressure resistance', es: 'Resistencia a la presión' },
      },
      {
        id: 'self_directed_action',
        label: { en: 'Self-directed action', es: 'Acción autodirigida' },
      },
      {
        id: 'choice_ownership',
        label: {
          en: 'Choice ownership',
          es: 'Responsabilidad sobre la elección',
        },
      },
    ],
    allowedContexts: [
      'uncertainty',
      'social_risk',
      'authority',
      'responsibility',
      'change',
      'exploration',
    ],
    ...commonMinimum,
  },
  {
    id: 'structure',
    label: { en: 'Structure', es: 'Estructura' },
    definition: {
      en: 'Tendency to organize information, sequence actions, define roles and reduce avoidable disorder.',
      es: 'Tendencia a organizar información, secuenciar acciones, definir roles y reducir el desorden evitable.',
    },
    inclusionCriteria: [
      'planning',
      'prioritization',
      'procedural thinking',
      'preparation',
    ],
    exclusionCriteria: ['inflexibility', 'perfectionism', 'need for control'],
    facets: [
      { id: 'planning', label: { en: 'Planning', es: 'Planificación' } },
      {
        id: 'prioritization',
        label: { en: 'Prioritization', es: 'Priorización' },
      },
      {
        id: 'procedural_thinking',
        label: { en: 'Procedural thinking', es: 'Pensamiento procedimental' },
      },
      { id: 'organization', label: { en: 'Organization', es: 'Organización' } },
      { id: 'preparation', label: { en: 'Preparation', es: 'Preparación' } },
    ],
    allowedContexts: [
      'uncertainty',
      'time_pressure',
      'resource_scarcity',
      'group_coordination',
      'responsibility',
      'change',
    ],
    ...commonMinimum,
  },
  {
    id: 'risk_tolerance',
    label: { en: 'Risk Orientation', es: 'Orientación al riesgo' },
    definition: {
      en: 'Willingness to accept uncertainty, potential loss or incomplete information when a perceived benefit justifies exposure.',
      es: 'Disposición a aceptar incertidumbre, pérdida potencial o información incompleta cuando un beneficio percibido justifica la exposición.',
    },
    inclusionCriteria: [
      'downside awareness',
      'calculated exposure',
      'willingness to commit',
    ],
    exclusionCriteria: [
      'impulsivity',
      'recklessness',
      'courage as a moral label',
    ],
    facets: [
      {
        id: 'downside_tolerance',
        label: {
          en: 'Downside tolerance',
          es: 'Tolerancia a consecuencias adversas',
        },
      },
      {
        id: 'calculated_risk',
        label: { en: 'Calculated risk', es: 'Riesgo calculado' },
      },
      {
        id: 'commitment_under_uncertainty',
        label: {
          en: 'Commitment under uncertainty',
          es: 'Compromiso ante la incertidumbre',
        },
      },
    ],
    allowedContexts: [
      'uncertainty',
      'time_pressure',
      'physical_risk',
      'social_risk',
      'resource_scarcity',
      'exploration',
    ],
    ...commonMinimum,
  },
  {
    id: 'openness_to_uncertainty',
    label: { en: 'Openness to Uncertainty', es: 'Apertura a la incertidumbre' },
    definition: {
      en: 'Willingness to remain cognitively and psychologically engaged while outcomes, explanations or paths remain incomplete.',
      es: 'Disposición a permanecer involucrado mental y emocionalmente cuando los resultados, las explicaciones o los caminos siguen incompletos.',
    },
    inclusionCriteria: [
      'ambiguity tolerance',
      'exploratory orientation',
      'holding multiple possibilities',
    ],
    exclusionCriteria: ['risk preference', 'creativity', 'indecision'],
    facets: [
      {
        id: 'ambiguity_tolerance',
        label: { en: 'Ambiguity tolerance', es: 'Tolerancia a la ambigüedad' },
      },
      {
        id: 'exploratory_orientation',
        label: {
          en: 'Exploratory orientation',
          es: 'Orientación exploratoria',
        },
      },
      {
        id: 'incomplete_answer_tolerance',
        label: {
          en: 'Incomplete-answer tolerance',
          es: 'Tolerancia a respuestas incompletas',
        },
      },
      {
        id: 'possibility_holding',
        label: { en: 'Holding possibilities', es: 'Apertura a posibilidades' },
      },
    ],
    allowedContexts: [
      'uncertainty',
      'exploration',
      'knowledge_gap',
      'change',
      'loss',
    ],
    ...commonMinimum,
  },
  {
    id: 'knowledge_orientation',
    label: { en: 'Knowledge Orientation', es: 'Orientación al conocimiento' },
    definition: {
      en: 'Tendency to seek understanding, evidence, explanation, context or accuracy before or during action.',
      es: 'Tendencia a buscar comprensión, evidencia, explicación, contexto o precisión antes de actuar o mientras se actúa.',
    },
    inclusionCriteria: [
      'investigation',
      'evidence seeking',
      'causal reasoning',
      'reflective analysis',
    ],
    exclusionCriteria: ['intelligence', 'education level', 'overthinking'],
    facets: [
      {
        id: 'investigation',
        label: { en: 'Investigation', es: 'Investigación' },
      },
      {
        id: 'evidence_seeking',
        label: { en: 'Evidence seeking', es: 'Búsqueda de evidencia' },
      },
      {
        id: 'causal_reasoning',
        label: { en: 'Causal reasoning', es: 'Razonamiento causal' },
      },
      {
        id: 'information_prioritization',
        label: {
          en: 'Information prioritization',
          es: 'Priorización de información',
        },
      },
      {
        id: 'reflective_analysis',
        label: { en: 'Reflective analysis', es: 'Análisis reflexivo' },
      },
    ],
    allowedContexts: [
      'uncertainty',
      'knowledge_gap',
      'exploration',
      'responsibility',
      'negotiation',
    ],
    ...commonMinimum,
  },
  {
    id: 'creation_orientation',
    label: { en: 'Creation Orientation', es: 'Orientación a la creación' },
    definition: {
      en: 'Tendency to generate, build, redesign, improvise or transform possibilities into tangible alternatives.',
      es: 'Tendencia a generar, construir, rediseñar, improvisar o transformar posibilidades en alternativas concretas.',
    },
    inclusionCriteria: [
      'ideation',
      'experimentation',
      'constructive improvisation',
      'making',
    ],
    exclusionCriteria: ['artistic talent', 'openness alone', 'novelty seeking'],
    facets: [
      { id: 'ideation', label: { en: 'Ideation', es: 'Ideación' } },
      {
        id: 'experimentation',
        label: { en: 'Experimentation', es: 'Experimentación' },
      },
      {
        id: 'constructive_improvisation',
        label: {
          en: 'Constructive improvisation',
          es: 'Improvisación constructiva',
        },
      },
      { id: 'design', label: { en: 'Design', es: 'Diseño' } },
      { id: 'making', label: { en: 'Making', es: 'Construcción' } },
    ],
    allowedContexts: [
      'creative_problem_solving',
      'resource_scarcity',
      'uncertainty',
      'change',
      'exploration',
    ],
    ...commonMinimum,
  },
  {
    id: 'empathy_cooperation',
    label: { en: 'Empathy & Cooperation', es: 'Empatía y cooperación' },
    definition: {
      en: 'Tendency to consider other perspectives, protect collective functioning and include interpersonal consequences in decisions.',
      es: 'Tendencia a considerar otras perspectivas, proteger el funcionamiento colectivo e incluir consecuencias interpersonales en las decisiones.',
    },
    inclusionCriteria: [
      'perspective taking',
      'prosocial response',
      'compromise',
      'coalition building',
    ],
    exclusionCriteria: [
      'passivity',
      'constant agreeableness',
      'self-sacrifice',
      'conflict avoidance',
    ],
    facets: [
      {
        id: 'perspective_taking',
        label: { en: 'Perspective taking', es: 'Toma de perspectiva' },
      },
      {
        id: 'prosocial_response',
        label: { en: 'Prosocial response', es: 'Respuesta prosocial' },
      },
      {
        id: 'compromise',
        label: { en: 'Compromise', es: 'Construcción de acuerdos' },
      },
      {
        id: 'interpersonal_concern',
        label: {
          en: 'Interpersonal concern',
          es: 'Consideración interpersonal',
        },
      },
      {
        id: 'coalition_building',
        label: { en: 'Coalition building', es: 'Construcción de alianzas' },
      },
    ],
    allowedContexts: [
      'group_coordination',
      'interpersonal_conflict',
      'moral_tradeoff',
      'negotiation',
      'caregiving',
      'loss',
      'responsibility',
    ],
    ...commonMinimum,
  },
  {
    id: 'social_confidence',
    label: { en: 'Social Confidence', es: 'Seguridad social' },
    definition: {
      en: 'Willingness to participate visibly, express a position, engage unfamiliar people and tolerate interpersonal exposure.',
      es: 'Disposición a participar de forma visible, expresar una posición, acercarse a personas desconocidas y tolerar la exposición interpersonal.',
    },
    inclusionCriteria: [
      'social approach',
      'assertive expression',
      'disagreement tolerance',
      'persuasion attempt',
    ],
    exclusionCriteria: ['extraversion', 'popularity', 'dominance'],
    facets: [
      {
        id: 'social_approach',
        label: { en: 'Social approach', es: 'Acercamiento social' },
      },
      {
        id: 'assertive_expression',
        label: { en: 'Assertive expression', es: 'Expresión asertiva' },
      },
      {
        id: 'disagreement_tolerance',
        label: { en: 'Disagreement tolerance', es: 'Tolerancia al desacuerdo' },
      },
      {
        id: 'interpersonal_visibility',
        label: {
          en: 'Interpersonal visibility',
          es: 'Visibilidad interpersonal',
        },
      },
      {
        id: 'persuasion_attempt',
        label: { en: 'Persuasion attempt', es: 'Intento de persuasión' },
      },
    ],
    allowedContexts: [
      'social_risk',
      'group_coordination',
      'interpersonal_conflict',
      'authority',
      'negotiation',
      'public_visibility',
    ],
    ...commonMinimum,
  },
  {
    id: 'leadership_initiative',
    label: { en: 'Leadership Initiative', es: 'Iniciativa de liderazgo' },
    definition: {
      en: 'Tendency to assume responsibility for coordination, direction or collective movement when action is needed.',
      es: 'Tendencia a asumir responsabilidad por la coordinación, la dirección o el movimiento colectivo cuando hace falta actuar.',
    },
    inclusionCriteria: [
      'responsibility assumption',
      'coordination',
      'decisiveness',
      'delegation',
      'mobilization',
    ],
    exclusionCriteria: [
      'dominance',
      'authoritarianism',
      'social confidence alone',
    ],
    facets: [
      {
        id: 'responsibility_assumption',
        label: {
          en: 'Responsibility assumption',
          es: 'Asunción de responsabilidad',
        },
      },
      { id: 'coordination', label: { en: 'Coordination', es: 'Coordinación' } },
      { id: 'decisiveness', label: { en: 'Decisiveness', es: 'Decisión' } },
      { id: 'delegation', label: { en: 'Delegation', es: 'Delegación' } },
      { id: 'mobilization', label: { en: 'Mobilization', es: 'Movilización' } },
    ],
    allowedContexts: [
      'time_pressure',
      'resource_scarcity',
      'group_coordination',
      'interpersonal_conflict',
      'authority',
      'public_visibility',
      'responsibility',
    ],
    ...commonMinimum,
  },
  {
    id: 'persistence',
    label: { en: 'Persistence', es: 'Persistencia' },
    definition: {
      en: 'Tendency to sustain effort toward a meaningful objective despite friction, delay, fatigue, setbacks or incomplete reward.',
      es: 'Tendencia a sostener el esfuerzo hacia un objetivo significativo a pesar de la fricción, la demora, el cansancio, los contratiempos o una recompensa incompleta.',
    },
    inclusionCriteria: [
      'sustained effort',
      'frustration tolerance',
      'goal commitment',
      'recovery after setbacks',
    ],
    exclusionCriteria: ['rigidity', 'obsession', 'inability to stop'],
    facets: [
      {
        id: 'sustained_effort',
        label: { en: 'Sustained effort', es: 'Esfuerzo sostenido' },
      },
      {
        id: 'frustration_tolerance',
        label: {
          en: 'Frustration tolerance',
          es: 'Tolerancia a la frustración',
        },
      },
      {
        id: 'goal_commitment',
        label: { en: 'Goal commitment', es: 'Compromiso con el objetivo' },
      },
      {
        id: 'setback_recovery',
        label: {
          en: 'Setback recovery',
          es: 'Recuperación ante contratiempos',
        },
      },
    ],
    allowedContexts: [
      'time_pressure',
      'physical_risk',
      'resource_scarcity',
      'loss',
      'change',
      'responsibility',
    ],
    ...commonMinimum,
  },
  {
    id: 'adaptability',
    label: { en: 'Adaptability', es: 'Adaptabilidad' },
    definition: {
      en: 'Tendency to update strategy or behavior when evidence, constraints, environment or priorities materially change.',
      es: 'Tendencia a actualizar la estrategia o la conducta cuando cambian de manera relevante la evidencia, las restricciones, el entorno o las prioridades.',
    },
    inclusionCriteria: [
      'strategy revision',
      'resource reallocation',
      'learning from feedback',
      'context switching',
    ],
    exclusionCriteria: ['indecision', 'inconsistency', 'lack of commitment'],
    facets: [
      {
        id: 'strategy_revision',
        label: { en: 'Strategy revision', es: 'Revisión de estrategia' },
      },
      { id: 'flexibility', label: { en: 'Flexibility', es: 'Flexibilidad' } },
      {
        id: 'resource_reallocation',
        label: { en: 'Resource reallocation', es: 'Reasignación de recursos' },
      },
      {
        id: 'feedback_learning',
        label: {
          en: 'Learning from feedback',
          es: 'Aprendizaje por retroalimentación',
        },
      },
      {
        id: 'contextual_switching',
        label: { en: 'Contextual switching', es: 'Cambio contextual' },
      },
    ],
    allowedContexts: [
      'uncertainty',
      'time_pressure',
      'resource_scarcity',
      'change',
      'loss',
      'creative_problem_solving',
    ],
    ...commonMinimum,
  },
  {
    id: 'emotional_regulation',
    label: { en: 'Emotional Regulation', es: 'Regulación emocional' },
    definition: {
      en: 'Tendency to preserve functional decision-making while experiencing stress, fear, uncertainty, frustration or interpersonal tension.',
      es: 'Tendencia a conservar decisiones funcionales mientras se experimenta estrés, miedo, incertidumbre, frustración o tensión interpersonal.',
    },
    inclusionCriteria: [
      'impulse regulation',
      'recovery',
      'affect tolerance',
      'emotional awareness',
      'composure',
    ],
    exclusionCriteria: ['suppression', 'emotional coldness', 'absence of fear'],
    facets: [
      {
        id: 'impulse_regulation',
        label: { en: 'Impulse regulation', es: 'Regulación de impulsos' },
      },
      {
        id: 'recovery',
        label: { en: 'Recovery', es: 'Recuperación emocional' },
      },
      {
        id: 'affect_tolerance',
        label: { en: 'Affect tolerance', es: 'Tolerancia afectiva' },
      },
      {
        id: 'emotional_awareness',
        label: { en: 'Emotional awareness', es: 'Conciencia emocional' },
      },
      {
        id: 'composure_under_pressure',
        label: {
          en: 'Composure under pressure',
          es: 'Compostura bajo presión',
        },
      },
    ],
    allowedContexts: [
      'uncertainty',
      'time_pressure',
      'physical_risk',
      'social_risk',
      'interpersonal_conflict',
      'loss',
      'public_visibility',
      'responsibility',
    ],
    ...commonMinimum,
  },
];

const byId = new Map(
  signalDefinitions.map((definition) => [definition.id, definition]),
);

if (
  signalDefinitions.length !== SIGNAL_KEYS.length ||
  SIGNAL_KEYS.some((key) => !byId.has(key))
)
  throw new Error('Signal registry must define all twelve canonical signals');

export function signalDefinition(key: SignalKey): SignalDefinition {
  return byId.get(key)!;
}
