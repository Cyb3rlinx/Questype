import { z } from 'zod';
import type { Locale } from '../i18n/locale.js';
import type { accumulatedProfile } from './service.js';

export const profileReportSchema = z.strictObject({
  templateVersion: z.literal('questype-profile.v1'),
  locale: z.enum(['en', 'es']),
  snapshotId: z.uuid(),
  generatedAt: z.iso.datetime(),
  displayName: z.string().nullable(),
  profileDepth: z.string(),
  journeysCompleted: z.number().int().nonnegative(),
  decisionsAnalyzed: z.number().int().nonnegative(),
  sections: z
    .array(
      z.strictObject({
        id: z.string(),
        title: z.string(),
        paragraphs: z.array(z.string()).min(1),
      }),
    )
    .min(6)
    .max(14),
  scopeNote: z.string(),
});

export type ProfileReportData = z.infer<typeof profileReportSchema>;
type ProfileView = Awaited<ReturnType<typeof accumulatedProfile>>;

function t(locale: Locale, en: string, es: string) {
  return locale === 'es' ? es : en;
}

export function generateProfileReport(
  view: ProfileView,
  locale: Locale,
): ProfileReportData {
  const snapshot = view.snapshot;
  if (!snapshot) throw new Error('A profile snapshot is required');
  const depthLabels: Record<string, string> = {
    en: {
      initial: 'Initial',
      emerging: 'Emerging',
      established: 'Established',
      extensive: 'Extensive',
    },
    es: {
      initial: 'Inicial',
      emerging: 'Emergente',
      established: 'Establecido',
      extensive: 'Extenso',
    },
  }[locale];
  const depthLabel =
    depthLabels[snapshot.profileDepth] ?? snapshot.profileDepth;
  const journeyCount =
    locale === 'es'
      ? `${snapshot.journeysCompleted} ${snapshot.journeysCompleted === 1 ? 'Journey completado' : 'Journeys completados'}`
      : `${snapshot.journeysCompleted} ${snapshot.journeysCompleted === 1 ? 'completed Journey' : 'completed Journeys'}`;
  const measured = snapshot.signals.filter(
    (signal) => signal.status === 'measured',
  );
  const unexplored = snapshot.signals.filter(
    (signal) => signal.status === 'unexplored',
  );
  const strongest = [...measured]
    .sort(
      (a, b) =>
        Math.abs((b.indicatorPosition ?? 50) - 50) -
          Math.abs((a.indicatorPosition ?? 50) - 50) ||
        a.label.localeCompare(b.label, locale),
    )
    .slice(0, 3);
  const sections: ProfileReportData['sections'] = [
    {
      id: 'overview',
      title: t(locale, 'Profile Overview', 'Panorama del perfil'),
      paragraphs: [
        t(
          locale,
          `Across ${journeyCount}, Questype analyzed ${snapshot.decisionsAnalyzed} decisions. Your current profile depth is ${depthLabel}.`,
          `A través de ${journeyCount}, Questype analizó ${snapshot.decisionsAnalyzed} decisiones. La profundidad actual de tu perfil es ${depthLabel}.`,
        ),
      ],
    },
    {
      id: 'journeys',
      title: t(locale, 'Journeys Completed', 'Journeys completados'),
      paragraphs:
        view.timeline.length > 0
          ? view.timeline.map(
              (item) =>
                `${item.title} · ${item.resultSummary} · ${new Date(
                  item.date,
                ).toLocaleDateString(locale, { timeZone: 'UTC' })}`,
            )
          : [
              t(
                locale,
                'No completed Journeys yet.',
                'Todavía no hay Journeys completados.',
              ),
            ],
    },
    {
      id: 'dimensions',
      title: t(locale, 'Core Dimensions', 'Dimensiones centrales'),
      paragraphs:
        measured.length > 0
          ? measured.map(
              (signal) =>
                `${signal.label}: ${signal.pattern}. ${signal.definition}`,
            )
          : [
              t(
                locale,
                'No dimension has enough evidence to display yet.',
                'Ninguna dimensión reúne evidencia suficiente para mostrarse todavía.',
              ),
            ],
    },
    {
      id: 'strongest-patterns',
      title: t(
        locale,
        'Strongest Observed Patterns',
        'Patrones observados más claros',
      ),
      paragraphs:
        strongest.length > 0
          ? strongest.map((signal) => `${signal.label}: ${signal.pattern}.`)
          : [
              t(
                locale,
                'More Journeys are needed before a pattern can be described.',
                'Se necesitan más Journeys antes de describir un patrón.',
              ),
            ],
    },
    {
      id: 'contexts',
      title: t(locale, 'Context Notes', 'Notas de contexto'),
      paragraphs:
        measured.filter((signal) => signal.contexts.length > 0).length > 0
          ? measured
              .filter((signal) => signal.contexts.length > 0)
              .map(
                (signal) =>
                  `${signal.label}: ${t(locale, 'observed across', 'observado en')} ${signal.contexts.join(', ')}.`,
              )
          : [
              t(
                locale,
                'Context coverage will grow as additional Journeys are completed.',
                'La cobertura de contextos crecerá al completar nuevos Journeys.',
              ),
            ],
    },
  ];
  const archetype = view.timeline.find(
    (item) => item.journeyId === 'journey_unwritten_road',
  );
  if (archetype)
    sections.push({
      id: 'archetype-result',
      title: t(
        locale,
        'Archetype Journey Result',
        'Resultado del Journey arquetípico',
      ),
      paragraphs: [
        `${archetype.title}: ${archetype.resultSummary}.`,
        t(
          locale,
          'This remains a Journey-specific result and is not averaged into the twelve profile signals.',
          'Este resultado pertenece a su Journey y no se promedia dentro de las doce señales del perfil.',
        ),
      ],
    });
  const leadership = measured.filter((signal) =>
    [
      'leadership_initiative',
      'social_confidence',
      'empathy_cooperation',
    ].includes(signal.id),
  );
  if (leadership.length > 0)
    sections.push({
      id: 'leadership',
      title: t(locale, 'Leadership Insights', 'Observaciones sobre liderazgo'),
      paragraphs: leadership.map(
        (signal) => `${signal.label}: ${signal.pattern}.`,
      ),
    });
  const pressure = measured.filter((signal) =>
    [
      'risk_tolerance',
      'adaptability',
      'persistence',
      'emotional_regulation',
    ].includes(signal.id),
  );
  if (pressure.length > 0)
    sections.push({
      id: 'pressure',
      title: t(locale, 'Pressure & Adaptability', 'Presión y adaptabilidad'),
      paragraphs: pressure.map(
        (signal) => `${signal.label}: ${signal.pattern}.`,
      ),
    });
  sections.push(
    {
      id: 'strengths',
      title: t(locale, 'Strengths to Use', 'Fortalezas para utilizar'),
      paragraphs:
        strongest.length > 0
          ? strongest.map((signal) =>
              t(
                locale,
                `${signal.label} may be a useful resource when the situation calls for it.`,
                `${signal.label} puede ser un recurso útil cuando la situación lo requiera.`,
              ),
            )
          : [
              t(
                locale,
                'Keep exploring before drawing a conclusion.',
                'Continúa explorando antes de llegar a una conclusión.',
              ),
            ],
    },
    {
      id: 'patterns-to-watch',
      title: t(locale, 'Patterns to Observe', 'Patrones para observar'),
      paragraphs: [
        t(
          locale,
          'A useful pattern in one setting can carry a cost in another. Notice when your preferred strategy fits the situation and when an alternative would serve you better.',
          'Un patrón útil en un contexto puede tener un costo en otro. Observa cuándo tu estrategia preferida se adapta a la situación y cuándo otra alternativa podría servirte mejor.',
        ),
      ],
    },
    {
      id: 'unexplored',
      title: t(locale, 'Areas Still to Explore', 'Áreas por explorar'),
      paragraphs:
        unexplored.length > 0
          ? unexplored.map((signal) =>
              t(
                locale,
                `${signal.label} does not yet have enough evidence.`,
                `${signal.label} todavía no reúne evidencia suficiente.`,
              ),
            )
          : [
              t(
                locale,
                'All current dimensions have usable evidence.',
                'Todas las dimensiones actuales tienen evidencia utilizable.',
              ),
            ],
    },
    {
      id: 'growth',
      title: t(locale, 'Growth Reflection', 'Reflexión de crecimiento'),
      paragraphs: [
        t(
          locale,
          'Which pattern felt most natural in the story, and which one would you like to practice more deliberately outside it?',
          '¿Qué patrón se sintió más natural dentro de la historia y cuál te gustaría practicar con mayor intención fuera de ella?',
        ),
      ],
    },
    {
      id: 'method',
      title: t(locale, 'Method & Scope', 'Método y alcance'),
      paragraphs: [
        t(
          locale,
          'The profile combines normalized, traceable evidence from the latest completed result of each Journey. Repeating one Journey does not multiply its influence. Missing dimensions remain undisplayed.',
          'El perfil combina evidencia normalizada y rastreable del resultado más reciente de cada Journey. Repetir un Journey no multiplica su influencia. Las dimensiones faltantes permanecen sin puntuación.',
        ),
      ],
    },
    {
      id: 'final-reflection',
      title: t(locale, 'Final Reflection', 'Reflexión final'),
      paragraphs: [
        t(
          locale,
          'A profile is a record of choices made across situations, not a limit on who you can become. Let the next Journey add another context and another question.',
          'Un perfil es un registro de decisiones tomadas en distintos contextos, no un límite sobre quién puedes llegar a ser. Deja que el próximo Journey aporte otra situación y otra pregunta.',
        ),
      ],
    },
  );
  return profileReportSchema.parse({
    templateVersion: 'questype-profile.v1',
    locale,
    snapshotId: snapshot.id,
    generatedAt: snapshot.createdAt,
    displayName: view.user.displayName,
    profileDepth: depthLabel,
    journeysCompleted: snapshot.journeysCompleted,
    decisionsAnalyzed: snapshot.decisionsAnalyzed,
    sections,
    scopeNote: t(
      locale,
      'Questype is designed for reflection and personal insight. It is not a clinical diagnosis or a substitute for professional psychological assessment.',
      'Questype está diseñado para la reflexión y el autoconocimiento. No es un diagnóstico clínico ni sustituye una evaluación psicológica profesional.',
    ),
  });
}
