import type { Locale } from '../../i18n/locale.js';
import type { JourneyPublicManifest } from '../journeys/contracts.js';
import { signalDefinitions } from '../signals/registry.js';
import type {
  JourneySignalAssessment,
  SignalKey,
} from '../signals/contracts.js';
import {
  signalJourneyReportSchema,
  type SignalJourneyReportData,
} from './contracts.js';

const t = (locale: Locale, en: string, es: string) =>
  locale === 'es' ? es : en;
const definitionById = new Map(
  signalDefinitions.map((definition) => [definition.id, definition]),
);

function dimensionPattern(
  locale: Locale,
  label: string,
  value: number | null,
  band: string,
) {
  if (value === null || band === 'insufficient')
    return t(
      locale,
      `${label} has not been explored enough in this Journey.`,
      `${label} todavía no fue explorada con suficiente evidencia en este Journey.`,
    );
  if (value >= 0.28)
    return t(
      locale,
      `Your choices showed a clearer tendency toward the higher-expression side of ${label.toLowerCase()} in these situations.`,
      `Tus decisiones mostraron una tendencia más clara hacia una mayor expresión de ${label.toLowerCase()} en estas situaciones.`,
    );
  if (value <= -0.28)
    return t(
      locale,
      `Your choices more often favored strategies that used less ${label.toLowerCase()} in these situations.`,
      `Tus decisiones favorecieron con mayor frecuencia estrategias que utilizaron menos ${label.toLowerCase()} en estas situaciones.`,
    );
  return t(
    locale,
    `Your choices varied across situations, without one clear direction for ${label.toLowerCase()}.`,
    `Tus decisiones variaron según la situación, sin una dirección clara para ${label.toLowerCase()}.`,
  );
}

function sectionParagraphs(
  report: SignalJourneyReportData,
  ids: readonly SignalKey[],
  locale: Locale,
) {
  const items = ids
    .map((id) => report.dimensions.find((dimension) => dimension.id === id))
    .filter(
      (dimension): dimension is SignalJourneyReportData['dimensions'][number] =>
        Boolean(dimension),
    );
  const measured = items.filter((dimension) => dimension.status === 'measured');
  return measured.length
    ? measured.map((dimension) => dimension.pattern)
    : [
        t(
          locale,
          'This area needs more evidence before Questype can describe a pattern.',
          'Esta área necesita más evidencia antes de que Questype pueda describir un patrón.',
        ),
      ];
}

const sectionSpecs: Record<
  string,
  readonly {
    id: string;
    title: [string, string];
    signals: readonly SignalKey[];
  }[]
> = {
  journey_council_realms: [
    {
      id: 'leadership-pattern',
      title: ['Your Leadership Pattern', 'Tu patrón de liderazgo'],
      signals: ['leadership_initiative'],
    },
    {
      id: 'coordination',
      title: ['How You Coordinate', 'Cómo coordinas'],
      signals: ['leadership_initiative', 'structure', 'empathy_cooperation'],
    },
    {
      id: 'influence',
      title: ['How You Influence', 'Cómo influyes'],
      signals: ['social_confidence', 'autonomy'],
    },
    {
      id: 'disagreement',
      title: ['How You Handle Disagreement', 'Cómo abordas el desacuerdo'],
      signals: [
        'social_confidence',
        'emotional_regulation',
        'empathy_cooperation',
      ],
    },
    {
      id: 'collective-strengths',
      title: [
        'Strengths in Collective Decisions',
        'Fortalezas en decisiones colectivas',
      ],
      signals: ['leadership_initiative', 'empathy_cooperation', 'structure'],
    },
  ],
  journey_stormbound_passage: [
    {
      id: 'pressure-pattern',
      title: [
        'Your Pressure Decision Pattern',
        'Tu patrón de decisión bajo presión',
      ],
      signals: ['risk_tolerance', 'adaptability', 'emotional_regulation'],
    },
    {
      id: 'risk-orientation',
      title: ['Risk Orientation', 'Orientación al riesgo'],
      signals: ['risk_tolerance'],
    },
    {
      id: 'adaptability',
      title: ['Adaptability', 'Adaptabilidad'],
      signals: ['adaptability'],
    },
    {
      id: 'persistence',
      title: ['Persistence', 'Persistencia'],
      signals: ['persistence'],
    },
    {
      id: 'emotional-regulation',
      title: ['Emotional Regulation', 'Regulación emocional'],
      signals: ['emotional_regulation'],
    },
    {
      id: 'uncertainty-response',
      title: [
        'How You Respond to Uncertainty',
        'Cómo respondes ante la incertidumbre',
      ],
      signals: ['openness_to_uncertainty', 'structure', 'autonomy'],
    },
  ],
};

export function generateSignalJourneyReport(input: {
  assessment: JourneySignalAssessment;
  manifest: JourneyPublicManifest;
  locale: Locale;
  generatedAt?: string;
}): SignalJourneyReportData {
  const { assessment, manifest, locale } = input;
  if (manifest.id !== assessment.journeyId)
    throw new Error('Assessment and Journey manifest do not match');
  const focus = manifest.focus.filter((id): id is SignalKey =>
    definitionById.has(id as SignalKey),
  );
  const dimensions = focus.map((id) => {
    const measurement = assessment.signals[id];
    const definition = definitionById.get(id)!;
    const label = definition.label[locale];
    return {
      id,
      label,
      status:
        measurement.value === null
          ? ('unexplored' as const)
          : ('measured' as const),
      evidenceBand: measurement.band,
      pattern: dimensionPattern(
        locale,
        label,
        measurement.value,
        measurement.band,
      ),
      observations: measurement.observations,
      scenes: measurement.scenes,
      contexts: measurement.contextIds,
    };
  });
  const provisional = {
    templateVersion: 'questype-journey-signals.v1' as const,
    locale,
    resultId: assessment.resultId,
    journeyId: assessment.journeyId,
    journeyVersion: assessment.journeyVersion,
    scoringVersion: assessment.scoringVersion,
    signalModelId: assessment.signalModelId,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    title: manifest.title[locale],
    assessmentFocus: manifest.assessmentFocus[locale],
    decisionsAnalyzed: assessment.decisionsAnalyzed,
    dimensions,
    sections: [] as SignalJourneyReportData['sections'],
    scopeNote: t(
      locale,
      'Questype is designed for reflection and personal insight. This report describes patterns in choices made within one fictional Journey; it is not a clinical diagnosis, a hiring assessment or a validated psychometric scale.',
      'Questype está diseñado para la reflexión y el autoconocimiento. Este informe describe patrones en decisiones tomadas dentro de un Journey ficticio; no es un diagnóstico clínico, una evaluación laboral ni una escala psicométrica validada.',
    ),
  };
  const sections = (sectionSpecs[assessment.journeyId] ?? []).map((spec) => ({
    id: spec.id,
    title: locale === 'es' ? spec.title[1] : spec.title[0],
    paragraphs: sectionParagraphs(provisional, spec.signals, locale),
  }));
  sections.push(
    {
      id: 'patterns-to-watch',
      title: t(locale, 'Patterns to Watch', 'Patrones para observar'),
      paragraphs: [
        t(
          locale,
          'A strategy that helped in one scene may carry a cost in another. Notice when your preferred response fits the context and when another approach could serve the situation better.',
          'Una estrategia útil en una escena puede tener un costo en otra. Observa cuándo tu respuesta preferida se ajusta al contexto y cuándo otro enfoque podría servir mejor a la situación.',
        ),
      ],
    },
    {
      id: 'context-notes',
      title: t(locale, 'Context Notes', 'Notas de contexto'),
      paragraphs: dimensions.some(
        (dimension) => dimension.status === 'measured',
      )
        ? dimensions
            .filter((dimension) => dimension.status === 'measured')
            .map(
              (dimension) =>
                `${dimension.label}: ${dimension.contexts.length ? dimension.contexts.join(', ') : t(locale, 'limited context coverage', 'cobertura de contexto limitada')}.`,
            )
        : [
            t(
              locale,
              'This Journey does not yet contain enough completed evidence for contextual notes.',
              'Este Journey todavía no contiene suficiente evidencia completada para ofrecer notas de contexto.',
            ),
          ],
    },
    {
      id: 'evidence-coverage',
      title: t(locale, 'Evidence Coverage', 'Cobertura de evidencia'),
      paragraphs: dimensions.map((dimension) =>
        dimension.status === 'measured'
          ? `${dimension.label}: ${dimension.evidenceBand}; ${dimension.scenes} ${t(locale, 'scenes', 'escenas')}; ${dimension.contexts.length} ${t(locale, 'contexts', 'contextos')}.`
          : dimension.pattern,
      ),
    },
  );
  return signalJourneyReportSchema.parse({ ...provisional, sections });
}
