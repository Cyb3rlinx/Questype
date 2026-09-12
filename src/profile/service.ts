import { randomUUID } from 'node:crypto';
import type { D1Database } from '@cloudflare/workers-types';
import { stableHash } from '../database/content-hash.js';
import { aggregateSignalAssessments } from '../domain/signals/engine.js';
import {
  EVIDENCE_BANDS,
  SIGNAL_KEYS,
  SIGNAL_CONTEXTS,
  type EvidenceBand,
  type JourneySignalAssessment,
  type SignalContext,
  type SignalKey,
  type SignalMeasurement,
} from '../domain/signals/contracts.js';
import { signalDefinition } from '../domain/signals/registry.js';
import type { Locale } from '../i18n/locale.js';
import { getJourneyDefinitionById } from '../domain/journeys/registry.js';
import {
  refreshArchetypePercentages,
  structuredProfileSchema,
} from '../domain/scoring/profile.js';
import { archetypeName, localizedCharacterTitle } from '../i18n/archetypes.js';

const PROFILE_VERSION = '1.0';

interface AssessmentRow {
  result_id: string;
  model_id: string;
  decisions_analyzed: number;
  fingerprint: string;
  journey_id: string;
  journey_version: string;
  scoring_version: string;
  result_created_at: number;
}

interface ScoreRow {
  signal_id: string;
  value_milli: number | null;
  band: string;
  observations: number;
  contributing_observations: number;
  scene_count: number;
  context_count: number;
  journey_count: number;
  scene_ids_json: string;
  context_ids_json: string;
  opportunity_coverage_milli: number;
  directional_consistency_milli: number;
}

interface SnapshotRow {
  id: string;
  sequence: number;
  version: string;
  aggregation_version: string;
  source_count: number;
  journey_count: number;
  decisions_analyzed: number;
  profile_depth: string;
  fingerprint: string;
  profile_json: string;
  coverage_json: string;
  created_at: number;
}

function evidenceBand(value: string): EvidenceBand {
  if (EVIDENCE_BANDS.includes(value as EvidenceBand))
    return value as EvidenceBand;
  throw new Error(`Unknown evidence band in D1: ${value}`);
}

function contexts(value: string): SignalContext[] {
  const parsed = JSON.parse(value) as unknown;
  if (
    !Array.isArray(parsed) ||
    parsed.some((item) => !SIGNAL_CONTEXTS.includes(item as SignalContext))
  )
    throw new Error('Invalid signal contexts in D1');
  return [...parsed].sort() as SignalContext[];
}

function scoreMeasurement(row: ScoreRow, signal: SignalKey): SignalMeasurement {
  if (row.signal_id !== signal) throw new Error('Signal score row mismatch');
  return {
    signal,
    value: row.value_milli === null ? null : row.value_milli / 1000,
    band: evidenceBand(row.band),
    observations: row.observations,
    contributingObservations: row.contributing_observations,
    scenes: row.scene_count,
    contexts: row.context_count,
    journeys: row.journey_count,
    sceneIds: JSON.parse(row.scene_ids_json) as string[],
    contextIds: contexts(row.context_ids_json),
    opportunityCoverage: row.opportunity_coverage_milli / 1000,
    directionalConsistency: row.directional_consistency_milli / 1000,
  };
}

async function sourceAssessments(
  db: D1Database,
  userId: string,
): Promise<{ assessments: JourneySignalAssessment[]; rows: AssessmentRow[] }> {
  const query = await db
    .prepare(
      'SELECT rsa.result_id,rsa.model_id,rsa.decisions_analyzed,rsa.fingerprint,j.id AS journey_id,jv.version AS journey_version,jv.scoring_version,r.created_at AS result_created_at FROM result_claims c JOIN web_results r ON r.id=c.result_id JOIN web_sessions s ON s.id=r.session_id JOIN result_signal_assessments rsa ON rsa.result_id=r.id JOIN journey_versions jv ON jv.id=s.journey_version_id JOIN journeys j ON j.id=s.journey_id WHERE c.user_id=? ORDER BY r.created_at DESC,r.id DESC',
    )
    .bind(userId)
    .all<AssessmentRow>();
  const latestByJourney = new Map<string, AssessmentRow>();
  for (const row of query.results)
    if (!latestByJourney.has(row.journey_id))
      latestByJourney.set(row.journey_id, row);
  const rows = [...latestByJourney.values()].sort((a, b) =>
    a.journey_id.localeCompare(b.journey_id, 'en'),
  );
  const assessments = await Promise.all(
    rows.map(async (row) => {
      const scores = await db
        .prepare(
          'SELECT signal_id,value_milli,band,observations,contributing_observations,scene_count,context_count,journey_count,scene_ids_json,context_ids_json,opportunity_coverage_milli,directional_consistency_milli FROM result_construct_scores WHERE result_id=?',
        )
        .bind(row.result_id)
        .all<ScoreRow>();
      const bySignal = new Map(
        scores.results.map((score) => [score.signal_id, score]),
      );
      const signals = Object.fromEntries(
        SIGNAL_KEYS.map((signal) => {
          const score = bySignal.get(signal);
          if (!score) throw new Error(`Missing ${signal} for ${row.result_id}`);
          return [signal, scoreMeasurement(score, signal)];
        }),
      ) as Record<SignalKey, SignalMeasurement>;
      return {
        resultId: row.result_id,
        journeyId: row.journey_id,
        journeyVersion: row.journey_version,
        scoringVersion: row.scoring_version,
        signalModelId: row.model_id,
        signalModelVersion: '1.0' as const,
        decisionsAnalyzed: row.decisions_analyzed,
        signals,
        evidence: [],
        fingerprint: row.fingerprint,
      };
    }),
  );
  return { assessments, rows };
}

export async function createProfileSnapshot(
  db: D1Database,
  userId: string,
): Promise<string | null> {
  const sources = await sourceAssessments(db, userId);
  if (sources.assessments.length === 0) return null;
  const profile = aggregateSignalAssessments(sources.assessments);
  const coverage = {
    measured: SIGNAL_KEYS.filter((key) => profile.signals[key].value !== null),
    insufficient: SIGNAL_KEYS.filter(
      (key) => profile.signals[key].value === null,
    ),
    signals: Object.fromEntries(
      SIGNAL_KEYS.map((key) => [
        key,
        {
          band: profile.signals[key].band,
          journeys: profile.signals[key].journeys,
          scenes: profile.signals[key].scenes,
          contexts: profile.signals[key].contextIds,
        },
      ]),
    ),
  };
  const fingerprint = stableHash({
    userId,
    profileVersion: PROFILE_VERSION,
    aggregateFingerprint: profile.fingerprint,
  });
  const existing = await db
    .prepare(
      'SELECT id FROM profile_snapshots WHERE user_id=? AND fingerprint=?',
    )
    .bind(userId, fingerprint)
    .first<{ id: string }>();
  if (existing) return existing.id;
  const last = await db
    .prepare(
      'SELECT COALESCE(MAX(sequence),0) AS sequence FROM profile_snapshots WHERE user_id=?',
    )
    .bind(userId)
    .first<{ sequence: number }>();
  const id = randomUUID();
  const sequence = (last?.sequence ?? 0) + 1;
  const now = Date.now();
  const statements = [
    db
      .prepare(
        'INSERT INTO profile_snapshots(id,user_id,sequence,version,aggregation_version,source_count,journey_count,decisions_analyzed,profile_depth,fingerprint,profile_json,coverage_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,fingerprint) DO NOTHING',
      )
      .bind(
        id,
        userId,
        sequence,
        PROFILE_VERSION,
        profile.aggregationVersion,
        sources.rows.length,
        profile.journeysCompleted,
        profile.decisionsAnalyzed,
        profile.profileDepth,
        fingerprint,
        JSON.stringify(profile),
        JSON.stringify(coverage),
        now,
      ),
    ...sources.rows.map((row) =>
      db
        .prepare(
          'INSERT INTO profile_snapshot_sources(snapshot_id,result_id,journey_id,journey_version,scoring_version,signal_model_id,result_created_at) SELECT ?,?,?,?,?,?,? FROM profile_snapshots WHERE id=? ON CONFLICT(snapshot_id,result_id) DO NOTHING',
        )
        .bind(
          id,
          row.result_id,
          row.journey_id,
          row.journey_version,
          row.scoring_version,
          row.model_id,
          row.result_created_at,
          id,
        ),
    ),
  ];
  await db.batch(statements);
  const stored = await db
    .prepare(
      'SELECT id FROM profile_snapshots WHERE user_id=? AND fingerprint=?',
    )
    .bind(userId, fingerprint)
    .first<{ id: string }>();
  if (!stored) throw new Error('Profile snapshot could not be persisted');
  return stored.id;
}

const contextLabels: Record<SignalContext, { en: string; es: string }> = {
  uncertainty: { en: 'uncertainty', es: 'incertidumbre' },
  time_pressure: { en: 'time pressure', es: 'presión de tiempo' },
  physical_risk: { en: 'physical risk', es: 'riesgo físico' },
  social_risk: { en: 'social risk', es: 'riesgo social' },
  resource_scarcity: { en: 'resource scarcity', es: 'escasez de recursos' },
  group_coordination: { en: 'group coordination', es: 'coordinación grupal' },
  interpersonal_conflict: {
    en: 'interpersonal conflict',
    es: 'conflicto interpersonal',
  },
  moral_tradeoff: { en: 'moral trade-offs', es: 'tensiones morales' },
  authority: { en: 'authority', es: 'autoridad' },
  negotiation: { en: 'negotiation', es: 'negociación' },
  exploration: { en: 'exploration', es: 'exploración' },
  knowledge_gap: { en: 'knowledge gaps', es: 'información incompleta' },
  caregiving: { en: 'caregiving', es: 'cuidado' },
  loss: { en: 'loss', es: 'pérdida' },
  change: { en: 'change', es: 'cambio' },
  public_visibility: { en: 'public visibility', es: 'exposición pública' },
  responsibility: { en: 'responsibility', es: 'responsabilidad' },
  creative_problem_solving: {
    en: 'creative problem-solving',
    es: 'resolución creativa',
  },
};

function patternLabel(value: number, locale: Locale): string {
  if (value >= 0.35)
    return locale === 'es'
      ? 'Patrón expresado con frecuencia'
      : 'Frequently expressed pattern';
  if (value <= -0.35)
    return locale === 'es'
      ? 'Predominaron estrategias de contrapeso'
      : 'Counterbalancing strategies appeared more often';
  return locale === 'es'
    ? 'Patrón sensible al contexto'
    : 'Context-sensitive pattern';
}

function profileSignals(
  profile: ReturnType<typeof aggregateSignalAssessments>,
  locale: Locale,
) {
  return SIGNAL_KEYS.map((key) => {
    const definition = signalDefinition(key);
    const measurement = profile.signals[key];
    return {
      id: key,
      label: definition.label[locale],
      definition: definition.definition[locale],
      status:
        measurement.value === null
          ? ('unexplored' as const)
          : ('measured' as const),
      band: measurement.band,
      pattern:
        measurement.value === null
          ? locale === 'es'
            ? 'Esta dimensión todavía no fue explorada con evidencia suficiente.'
            : 'This dimension has not been explored with enough evidence yet.'
          : patternLabel(measurement.value, locale),
      indicatorPosition:
        measurement.value === null
          ? null
          : Math.round(((measurement.value + 1) / 2) * 100),
      observations: measurement.observations,
      journeys: measurement.journeys,
      contexts: measurement.contextIds.map(
        (context) => contextLabels[context][locale],
      ),
    };
  });
}

async function timeline(db: D1Database, userId: string, locale: Locale) {
  const result = await db
    .prepare(
      'SELECT r.id,r.profile_json,r.created_at,s.journey_id,jv.version AS journey_version,jv.scoring_version FROM result_claims c JOIN web_results r ON r.id=c.result_id JOIN web_sessions s ON s.id=r.session_id LEFT JOIN journey_versions jv ON jv.id=s.journey_version_id WHERE c.user_id=? ORDER BY r.created_at DESC,r.id DESC',
    )
    .bind(userId)
    .all<{
      id: string;
      profile_json: string;
      created_at: number;
      journey_id: string | null;
      journey_version: string | null;
      scoring_version: string | null;
    }>();
  return result.results.map((row) => {
    const definition = row.journey_id
      ? getJourneyDefinitionById(row.journey_id)
      : null;
    let resultSummary =
      locale === 'es' ? 'Resultado del Journey' : 'Journey result';
    const parsed = structuredProfileSchema.safeParse(
      JSON.parse(row.profile_json),
    );
    if (parsed.success) {
      const profile = refreshArchetypePercentages(parsed.data);
      resultSummary = `${localizedCharacterTitle(profile, locale)} · ${archetypeName(
        profile.archetypes.primary.slug,
        profile.archetypes.primary.name,
        locale,
      )}`;
    }
    return {
      resultId: row.id,
      date: new Date(row.created_at).toISOString(),
      journeyId: row.journey_id,
      journeyVersion: row.journey_version,
      scoringVersion: row.scoring_version,
      title:
        definition?.manifest.title[locale] ??
        (locale === 'es' ? 'Journey anterior' : 'Earlier Journey'),
      focus: definition?.manifest.focus.join(' · ') ?? '',
      resultSummary,
      reportUrl: `/api/results/${row.id}/report`,
      resultUrl: `/result/${row.id}`,
    };
  });
}

export async function accumulatedProfile(
  db: D1Database,
  user: { id: string; email: string; displayName: string | null },
  locale: Locale,
) {
  await createProfileSnapshot(db, user.id);
  const row = await db
    .prepare(
      'SELECT id,sequence,version,aggregation_version,source_count,journey_count,decisions_analyzed,profile_depth,fingerprint,profile_json,coverage_json,created_at FROM profile_snapshots WHERE user_id=? ORDER BY sequence DESC LIMIT 1',
    )
    .bind(user.id)
    .first<SnapshotRow>();
  const history = await timeline(db, user.id, locale);
  if (!row)
    return {
      user: { email: user.email, displayName: user.displayName },
      snapshot: null,
      timeline: history,
    };
  const profile = JSON.parse(row.profile_json) as ReturnType<
    typeof aggregateSignalAssessments
  >;
  return {
    user: { email: user.email, displayName: user.displayName },
    snapshot: {
      id: row.id,
      sequence: row.sequence,
      version: row.version,
      aggregationVersion: row.aggregation_version,
      sourceCount: row.source_count,
      journeysCompleted: row.journey_count,
      decisionsAnalyzed: row.decisions_analyzed,
      profileDepth: row.profile_depth,
      fingerprint: row.fingerprint,
      createdAt: new Date(row.created_at).toISOString(),
      signals: profileSignals(profile, locale),
    },
    timeline: history,
  };
}
