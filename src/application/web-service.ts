import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';
import {
  createSession,
  restoreSession,
  acceptAnswer,
  markSessionCompleted,
  toPublicScene,
  type JourneySession,
} from '../domain/journey/session.js';
import {
  generateStructuredProfile,
  refreshArchetypePercentages,
  structuredProfileSchema,
} from '../domain/scoring/profile.js';
import { deterministicInterpretation } from '../ai/fallback.js';
import { validateInterpretation } from '../ai/contracts.js';
import {
  createPublicProjection,
  publicResultSchema,
  readPublicProjection,
} from '../sharing/contracts.js';
import { userIdentitySchema } from '../domain/types.js';
import { localeFromRequest, type Locale } from '../i18n/locale.js';
import { archetypeName, localizedCharacterTitle } from '../i18n/archetypes.js';
import { archetypeImage } from '../domain/archetype-images.js';
import {
  DEFAULT_JOURNEY_SLUG,
  getJourneyDefinitionById,
  requireJourneyDefinition,
} from '../domain/journeys/registry.js';
import type {
  JourneyDefinition,
  JourneyPublicManifest,
  JourneyServerModel,
  VisualAsset,
} from '../domain/journeys/contracts.js';
import { stableHash } from '../database/content-hash.js';
import { SIGNAL_KEYS } from '../domain/signals/contracts.js';
import { WebError, ownerHash, readJson } from './http.js';
import { authenticatedUser } from '../auth/service.js';
import { createProfileSnapshot } from '../profile/service.js';

export { WebError, ownerHash, readJson, guardMutation } from './http.js';

const COOKIE = 'archetype_visitor';
interface SessionRow {
  id: string;
  owner_hash: string;
  release_id: string;
  journey_id?: string | null;
  journey_version_id?: string | null;
  state_json: string;
  revision: number;
  status: string;
  current_scene: number;
  created_at: number;
  updated_at?: number | null;
  result_id?: string | null;
}
interface JourneyContext {
  definition: JourneyDefinition;
  manifest: JourneyPublicManifest;
  model: JourneyServerModel;
}

async function contextForDefinition(
  definition: JourneyDefinition,
): Promise<JourneyContext> {
  if (!definition.loadServerModel)
    throw new WebError(404, 'This journey is not currently available.');
  return {
    definition,
    manifest: definition.manifest,
    model: await definition.loadServerModel(),
  };
}

async function hasMultiJourneySchema(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='journey_versions'",
    )
    .first<{ name: string }>();
  return row?.name === 'journey_versions';
}

async function hasSignalSchema(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='result_signal_assessments'",
    )
    .first<{ name: string }>();
  return row?.name === 'result_signal_assessments';
}

async function hasResultClaimsSchema(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='result_claims'",
    )
    .first<{ name: string }>();
  return row?.name === 'result_claims';
}

async function ensureSignalModel(
  db: D1Database,
  context: JourneyContext,
): Promise<boolean> {
  const signalEngine = context.model.signalEngine;
  if (!signalEngine || !(await hasSignalSchema(db))) return false;
  const model = signalEngine.model;
  const modelHash = stableHash(model);
  await db
    .prepare(
      'INSERT INTO journey_signal_models(id,journey_version_id,schema_version,model_hash,snapshot,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
    )
    .bind(
      model.id,
      context.model.legacyReleaseId,
      model.schemaVersion,
      modelHash,
      JSON.stringify(model),
      Date.now(),
    )
    .run();
  const stored = await db
    .prepare(
      'SELECT journey_version_id,model_hash FROM journey_signal_models WHERE id=?',
    )
    .bind(model.id)
    .first<{ journey_version_id: string; model_hash: string }>();
  if (
    stored?.journey_version_id !== context.model.legacyReleaseId ||
    stored.model_hash !== modelHash
  )
    throw new WebError(
      409,
      'This psychological evidence model has changed and cannot overwrite its released version.',
    );
  return true;
}

function requestedJourneySlug(request: Request): string {
  return (
    new URL(request.url).searchParams.get('journey_slug') ??
    DEFAULT_JOURNEY_SLUG
  );
}

function definitionForSlug(slug: string): JourneyDefinition {
  try {
    const definition = requireJourneyDefinition(slug);
    if (definition.manifest.status !== 'published')
      throw new WebError(404, 'This journey is not currently available.');
    return definition;
  } catch (error) {
    if (error instanceof WebError) throw error;
    throw new WebError(404, 'This journey could not be found.');
  }
}

async function release(db: D1Database, context: JourneyContext) {
  const { manifest, model } = context;
  await db
    .prepare(
      'INSERT INTO web_releases(id,content_hash,snapshot,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING',
    )
    .bind(
      model.legacyReleaseId,
      model.contentHash,
      JSON.stringify(model.content),
      Date.now(),
    )
    .run();
  const multiJourney = await hasMultiJourneySchema(db);
  if (!multiJourney) {
    const legacy = await db
      .prepare('SELECT content_hash FROM web_releases WHERE id=?')
      .bind(model.legacyReleaseId)
      .first<{ content_hash: string }>();
    if (legacy?.content_hash !== model.contentHash)
      throw new WebError(
        409,
        'This story release has changed. Your previous progress remains saved.',
      );
    return false;
  }
  await db.batch([
    db
      .prepare(
        'INSERT INTO journeys(id,slug,status,access_tier,created_at,retired_at) VALUES (?,?,?,?,?,NULL) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,status=excluded.status,access_tier=excluded.access_tier',
      )
      .bind(
        manifest.id,
        manifest.slug,
        manifest.status,
        manifest.access,
        Date.now(),
      ),
    db
      .prepare(
        'INSERT INTO journey_versions(id,journey_id,version,content_hash,scoring_version,snapshot,published_at,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
      )
      .bind(
        model.legacyReleaseId,
        manifest.id,
        manifest.currentVersion,
        model.contentHash,
        manifest.scoringVersion,
        JSON.stringify(model.content),
        Date.now(),
        Date.now(),
      ),
  ]);
  const row = await db
    .prepare(
      'SELECT r.content_hash AS legacy_hash,v.content_hash AS version_hash FROM web_releases r JOIN journey_versions v ON v.id=r.id WHERE r.id=? AND v.journey_id=?',
    )
    .bind(model.legacyReleaseId, manifest.id)
    .first<{ legacy_hash: string; version_hash: string }>();
  if (
    row?.legacy_hash !== model.contentHash ||
    row.version_hash !== model.contentHash
  )
    throw new WebError(
      409,
      'This story release has changed. Your previous progress remains saved.',
    );
  await ensureSignalModel(db, context);
  return true;
}

async function contextForRow(row: SessionRow): Promise<JourneyContext> {
  const stored = JSON.parse(row.state_json) as { journey_id?: string };
  const definition = getJourneyDefinitionById(
    row.journey_id ?? stored.journey_id ?? '',
  );
  if (!definition)
    throw new WebError(409, 'This journey uses an unavailable story release.');
  const context = await contextForDefinition(definition);
  if (
    row.release_id !== context.model.legacyReleaseId ||
    (row.journey_version_id &&
      row.journey_version_id !== context.model.legacyReleaseId)
  )
    throw new WebError(409, 'This journey uses an earlier story release.');
  return context;
}

function state(row: SessionRow, context: JourneyContext) {
  return restoreSession(context.model.content, JSON.parse(row.state_json));
}

export async function findSession(
  db: D1Database,
  owner: string | null,
  options: { id?: string; definition?: JourneyDefinition } = {},
) {
  if (!owner) throw new WebError(404, 'No saved journey on this browser yet.');
  const idFilter = options.id ? 'AND s.id=?' : '';
  const multiJourney = await hasMultiJourneySchema(db);
  const journeyFilter =
    options.definition && multiJourney
      ? 'AND (s.journey_id=? OR (s.journey_id IS NULL AND s.release_id=?))'
      : options.definition
        ? 'AND s.release_id=?'
        : '';
  const params: unknown[] = [owner];
  if (options.id) params.push(options.id);
  if (options.definition) {
    const context = await contextForDefinition(options.definition);
    if (multiJourney)
      params.push(context.manifest.id, context.model.legacyReleaseId);
    else params.push(context.model.legacyReleaseId);
  }
  const row = await db
    .prepare(
      `SELECT s.*,r.id AS result_id FROM web_sessions s LEFT JOIN web_results r ON r.session_id=s.id WHERE s.owner_hash=? ${idFilter} ${journeyFilter} ORDER BY s.created_at DESC,s.id DESC LIMIT 1`,
    )
    .bind(...params)
    .first<SessionRow>();
  if (!row)
    throw new WebError(404, 'This journey could not be found on this browser.');
  return row;
}

function publicAsset(asset: VisualAsset, locale: Locale) {
  return {
    id: asset.id,
    src: asset.src,
    responsive_src: asset.responsiveSrc ?? null,
    width: asset.width,
    height: asset.height,
    focal_point: asset.focalPoint,
    alt: asset.alt[locale],
  };
}

function sceneVisual(
  context: JourneyContext,
  saved: JourneySession,
  sceneId: string,
  locale: Locale,
) {
  const visual =
    context.manifest.assets.scenes[saved.user.character_gender][sceneId];
  if (!visual)
    throw new WebError(503, 'This scene image is temporarily unavailable.');
  const inherited = visual.inheritsChoiceFrom
    ? saved.answers.find(
        (answer) => answer.scene_id === visual.inheritsChoiceFrom,
      )?.choice_id
    : undefined;
  const selected = inherited
    ? (visual.choiceVariants?.[inherited] ?? visual.default)
    : visual.default;
  return {
    default: publicAsset(selected, locale),
    choice_variants: visual.choiceVariants
      ? Object.fromEntries(
          Object.entries(visual.choiceVariants).map(([choiceId, asset]) => [
            choiceId,
            publicAsset(asset, locale),
          ]),
        )
      : {},
  };
}

function sessionView(
  row: SessionRow,
  context: JourneyContext,
  locale: Locale = 'en',
) {
  const saved = state(row, context);
  const currentScene = context.model.content.scenes[saved.answers.length];
  const currentVisual = currentScene
    ? context.manifest.assets.scenes[saved.user.character_gender][
        currentScene.id
      ]
    : undefined;
  const inheritedAnswer = currentVisual?.inheritsChoiceFrom
    ? saved.answers.find(
        (answer) => answer.scene_id === currentVisual.inheritsChoiceFrom,
      )
    : undefined;
  const inheritedVariant = inheritedAnswer
    ? Object.keys(currentVisual?.choiceVariants ?? {}).indexOf(
        inheritedAnswer.choice_id,
      ) + 1
    : 0;
  return {
    id: row.id,
    name: saved.user.name,
    character_gender: saved.user.character_gender,
    status: saved.status,
    current_scene: saved.current_scene,
    completed_scenes: saved.answers.length,
    total_scenes: context.model.content.scenes.length,
    journey: {
      id: context.manifest.id,
      slug: context.manifest.slug,
      version: context.manifest.currentVersion,
      title: context.manifest.title[locale],
      act_names: context.manifest.actNames[locale],
      act_count: context.manifest.actCount,
      estimated_minutes: context.manifest.estimatedMinutes,
    },
    result_id: row.result_id ?? null,
    scene_image_variant: inheritedVariant > 0 ? inheritedVariant : null,
    scene:
      saved.status === 'in_progress'
        ? (() => {
            const scene = context.model.content.scenes[saved.answers.length]!;
            return {
              ...toPublicScene(scene, saved.user.character_gender, locale),
              visual: sceneVisual(context, saved, scene.id, locale),
            };
          })()
        : null,
  };
}
export async function getSession(db: D1Database, request: Request) {
  const definition = definitionForSlug(requestedJourneySlug(request));
  const context = await contextForDefinition(definition);
  return sessionView(
    await findSession(db, ownerHash(request), { definition }),
    context,
    localeFromRequest(request),
  );
}
export async function startSession(db: D1Database, request: Request) {
  const input = z
    .strictObject({
      name: z.string().trim().max(60).optional().default(''),
      character_gender: z.enum(['man', 'woman']),
      request_id: z.uuid(),
      restart: z.boolean().optional(),
      journey_slug: z.string().min(3).max(80).optional(),
    })
    .parse(await readJson(request));
  const definition = definitionForSlug(
    input.journey_slug ?? DEFAULT_JOURNEY_SLUG,
  );
  const context = await contextForDefinition(definition);
  let owner = ownerHash(request);
  let cookie: string | null = null;
  if (owner && !input.restart) {
    try {
      const existing = await findSession(db, owner, { definition });
      if (state(existing, context).status !== 'completed')
        return {
          data: sessionView(existing, context, localeFromRequest(request)),
          cookie,
        };
    } catch (e) {
      if (!(e instanceof WebError && e.status === 404)) throw e;
    }
  }
  if (!owner) {
    const token = Buffer.from(randomBytes(32)).toString('hex');
    owner = createHash('sha256').update(token).digest('hex');
    cookie = `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
  }
  const count = await db
    .prepare(
      'SELECT count(*) AS n FROM web_sessions WHERE owner_hash=? AND created_at>?',
    )
    .bind(owner, Date.now() - 86400000)
    .first<{ n: number }>();
  if ((count?.n ?? 0) >= 30)
    throw new WebError(
      429,
      'You have started many journeys today. Please return tomorrow.',
    );
  const multiJourney = await release(db, context);
  const saved = createSession(
    context.model.content,
    userIdentitySchema.parse({
      name: input.name || null,
      character_gender: input.character_gender,
    }),
    { id: input.request_id, started_at: new Date().toISOString() },
  );
  const sessionInsert = multiJourney
    ? db
        .prepare(
          'INSERT INTO web_sessions(id,owner_hash,release_id,journey_id,journey_version_id,state_json,revision,status,current_scene,created_at,updated_at) VALUES (?,?,?,?,?,?,0,?,?,?,?) ON CONFLICT(id) DO NOTHING',
        )
        .bind(
          saved.id,
          owner,
          context.model.legacyReleaseId,
          context.manifest.id,
          context.model.legacyReleaseId,
          JSON.stringify(saved),
          saved.status,
          saved.current_scene,
          Date.now(),
          Date.now(),
        )
    : db
        .prepare(
          'INSERT INTO web_sessions(id,owner_hash,release_id,state_json,revision,status,current_scene,created_at) VALUES (?,?,?,?,0,?,?,?) ON CONFLICT(id) DO NOTHING',
        )
        .bind(
          saved.id,
          owner,
          context.model.legacyReleaseId,
          JSON.stringify(saved),
          saved.status,
          saved.current_scene,
          Date.now(),
        );
  await db.batch([
    db
      .prepare(
        'INSERT INTO web_visitors(owner_hash,created_at) VALUES (?,?) ON CONFLICT(owner_hash) DO NOTHING',
      )
      .bind(owner, Date.now()),
    sessionInsert,
  ]);
  return {
    data: sessionView(
      await findSession(db, owner, { id: saved.id, definition }),
      context,
      localeFromRequest(request),
    ),
    cookie,
  };
}
export async function submitAnswer(db: D1Database, request: Request) {
  const input = z
    .strictObject({
      session_id: z.uuid(),
      scene_id: z.string().max(30),
      choice_id: z.string().max(50),
    })
    .parse(await readJson(request));
  const owner = ownerHash(request);
  const row = await findSession(db, owner, { id: input.session_id });
  const context = await contextForRow(row);
  const before = state(row, context);
  let next: JourneySession;
  try {
    next = acceptAnswer(context.model.content, before, {
      scene_id: input.scene_id,
      choice_id: input.choice_id,
    });
  } catch (e) {
    throw new WebError(
      409,
      e instanceof Error ? e.message : 'Your journey changed in another tab.',
    );
  }
  if (next.answers.length === before.answers.length)
    return sessionView(row, context, localeFromRequest(request));
  const multiJourney = await hasMultiJourneySchema(db);
  const updateSession = multiJourney
    ? db
        .prepare(
          `UPDATE web_sessions SET state_json=?,status=?,current_scene=?,updated_at=?,revision=revision+1 WHERE id=? AND owner_hash=? AND revision=? AND EXISTS(SELECT 1 FROM web_answers WHERE session_id=? AND scene_id=? AND choice_id=?)`,
        )
        .bind(
          JSON.stringify(next),
          next.status,
          next.current_scene,
          Date.now(),
          row.id,
          owner,
          row.revision,
          row.id,
          input.scene_id,
          input.choice_id,
        )
    : db
        .prepare(
          `UPDATE web_sessions SET state_json=?,status=?,current_scene=?,revision=revision+1 WHERE id=? AND owner_hash=? AND revision=? AND EXISTS(SELECT 1 FROM web_answers WHERE session_id=? AND scene_id=? AND choice_id=?)`,
        )
        .bind(
          JSON.stringify(next),
          next.status,
          next.current_scene,
          row.id,
          owner,
          row.revision,
          row.id,
          input.scene_id,
          input.choice_id,
        );
  await db.batch([
    db
      .prepare(
        `INSERT INTO web_answers(session_id,scene_id,choice_id,position,answered_at) SELECT id,?,?,?,? FROM web_sessions WHERE id=? AND owner_hash=? AND revision=? AND status='in_progress' ON CONFLICT(session_id,scene_id) DO NOTHING`,
      )
      .bind(
        input.scene_id,
        input.choice_id,
        before.current_scene,
        Date.now(),
        row.id,
        owner,
        row.revision,
      ),
    updateSession,
  ]);
  const current = await findSession(db, owner, { id: row.id });
  const accepted = state(current, context).answers.find(
    (a) => a.scene_id === input.scene_id,
  );
  if (accepted?.choice_id !== input.choice_id)
    throw new WebError(
      409,
      'A different choice was saved in another tab. Refresh to continue your story.',
    );
  return sessionView(current, context, localeFromRequest(request));
}
export async function completeJourney(db: D1Database, request: Request) {
  const input = z
    .strictObject({ session_id: z.uuid() })
    .parse(await readJson(request));
  const owner = ownerHash(request);
  const row = await findSession(db, owner, { id: input.session_id });
  const context = await contextForRow(row);
  if (row.result_id) return { result_id: row.result_id };
  const saved = state(row, context);
  if (saved.status !== 'processing')
    throw new WebError(
      409,
      `Complete all ${context.manifest.sceneCount} moments before revealing your result.`,
    );
  const id = randomUUID(),
    now = new Date().toISOString();
  const profile = generateStructuredProfile(
    context.model.engine,
    saved.answers,
    saved.user,
    {
      id,
      created_at: now,
      content_hash: context.model.contentHash,
    },
  );
  const interpretation = deterministicInterpretation(profile);
  const completed = markSessionCompleted(context.model.content, saved, now);
  const multiJourney = await hasMultiJourneySchema(db);
  const signalReady = await ensureSignalModel(db, context);
  const signalAssessment =
    signalReady && context.model.signalEngine
      ? context.model.signalEngine.evaluate(saved.answers, { resultId: id })
      : null;
  const account = await authenticatedUser(db, request);
  const updateSession = multiJourney
    ? db
        .prepare(
          "UPDATE web_sessions SET state_json=?,status='completed',updated_at=?,revision=revision+1 WHERE id=? AND owner_hash=? AND revision=? AND EXISTS(SELECT 1 FROM web_results WHERE session_id=?)",
        )
        .bind(
          JSON.stringify(completed),
          Date.now(),
          row.id,
          owner,
          row.revision,
          row.id,
        )
    : db
        .prepare(
          "UPDATE web_sessions SET state_json=?,status='completed',revision=revision+1 WHERE id=? AND owner_hash=? AND revision=? AND EXISTS(SELECT 1 FROM web_results WHERE session_id=?)",
        )
        .bind(JSON.stringify(completed), row.id, owner, row.revision, row.id);
  const writes = [
    db
      .prepare(
        'INSERT INTO web_results(id,session_id,profile_json,interpretation_json,created_at) SELECT ?,id,?,?,? FROM web_sessions WHERE id=? AND owner_hash=? AND revision=? ON CONFLICT(session_id) DO NOTHING',
      )
      .bind(
        id,
        JSON.stringify(profile),
        JSON.stringify(interpretation),
        Date.now(),
        row.id,
        owner,
        row.revision,
      ),
  ];
  if (signalAssessment) {
    writes.push(
      db
        .prepare(
          'INSERT INTO result_signal_assessments(result_id,model_id,fingerprint,decisions_analyzed,created_at) SELECT ?,?,?,?,? FROM web_results WHERE id=? ON CONFLICT(result_id) DO NOTHING',
        )
        .bind(
          id,
          signalAssessment.signalModelId,
          signalAssessment.fingerprint,
          signalAssessment.decisionsAnalyzed,
          Date.now(),
          id,
        ),
    );
    for (const signal of SIGNAL_KEYS) {
      const measurement = signalAssessment.signals[signal];
      writes.push(
        db
          .prepare(
            'INSERT INTO result_construct_scores(result_id,signal_id,value_milli,band,observations,contributing_observations,scene_count,context_count,journey_count,scene_ids_json,context_ids_json,opportunity_coverage_milli,directional_consistency_milli) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? FROM result_signal_assessments WHERE result_id=? ON CONFLICT(result_id,signal_id) DO NOTHING',
          )
          .bind(
            id,
            signal,
            measurement.value === null
              ? null
              : Math.round(measurement.value * 1000),
            measurement.band,
            measurement.observations,
            measurement.contributingObservations,
            measurement.scenes,
            measurement.contexts,
            measurement.journeys,
            JSON.stringify(measurement.sceneIds),
            JSON.stringify(measurement.contextIds),
            Math.round(measurement.opportunityCoverage * 1000),
            Math.round(measurement.directionalConsistency * 1000),
            id,
          ),
      );
    }
    signalAssessment.evidence.forEach((evidence, index) => {
      writes.push(
        db
          .prepare(
            'INSERT INTO result_construct_evidence(id,result_id,model_id,scene_id,choice_id,signal_id,facet_id,context_id,direction,weight_milli,signed_contribution_milli,observation_type) SELECT ?,?,?,?,?,?,?,?,?,?,?,? FROM result_signal_assessments WHERE result_id=? ON CONFLICT(id) DO NOTHING',
          )
          .bind(
            stableHash({ resultId: id, index, evidence }).slice(0, 40),
            id,
            signalAssessment.signalModelId,
            evidence.sceneId,
            evidence.choiceId,
            evidence.signal,
            evidence.facet,
            evidence.context,
            evidence.direction,
            Math.round(evidence.weight * 1000),
            Math.round(evidence.signedContribution * 1000),
            evidence.observationType,
            id,
          ),
      );
    });
  }
  if (account) {
    writes.push(
      db
        .prepare(
          'INSERT OR IGNORE INTO result_claims(result_id,user_id,claimed_owner_hash,claimed_at) SELECT ?,?,?,? FROM web_results WHERE id=?',
        )
        .bind(id, account.id, owner, Date.now(), id),
    );
  }
  writes.push(updateSession);
  await db.batch(writes);
  if (account) await createProfileSnapshot(db, account.id);
  const final = await findSession(db, owner, { id: row.id });
  if (!final.result_id)
    throw new WebError(
      409,
      'Your journey changed. Please try revealing it again.',
    );
  return { result_id: final.result_id };
}
export async function getResult(db: D1Database, request: Request, id: string) {
  const account = await authenticatedUser(db, request);
  const owner = ownerHash(request) ?? '';
  const row = (await hasResultClaimsSchema(db))
    ? await db
        .prepare(
          'SELECT r.profile_json,r.interpretation_json FROM web_results r JOIN web_sessions s ON s.id=r.session_id LEFT JOIN result_claims c ON c.result_id=r.id WHERE r.id=? AND (s.owner_hash=? OR c.user_id=?)',
        )
        .bind(id, owner, account?.id ?? '')
        .first<{ profile_json: string; interpretation_json: string }>()
    : await db
        .prepare(
          'SELECT r.profile_json,r.interpretation_json FROM web_results r JOIN web_sessions s ON s.id=r.session_id WHERE r.id=? AND s.owner_hash=?',
        )
        .bind(id, owner)
        .first<{ profile_json: string; interpretation_json: string }>();
  if (!row)
    throw new WebError(
      404,
      'This result is private or is no longer available.',
    );
  const profile = refreshArchetypePercentages(
    structuredProfileSchema.parse(JSON.parse(row.profile_json)),
  );
  const stored = JSON.parse(row.interpretation_json) as ReturnType<
    typeof deterministicInterpretation
  >;
  const locale = localeFromRequest(request);
  const localized =
    locale === 'es' ? deterministicInterpretation(profile, locale) : stored;
  const signalAssessmentAvailable =
    (await hasSignalSchema(db)) &&
    Boolean(
      await db
        .prepare(
          'SELECT result_id FROM result_signal_assessments WHERE result_id=?',
        )
        .bind(id)
        .first(),
    );
  return {
    profile,
    interpretation: validateInterpretation(localized.interpretation, profile),
    interpretation_provider: localized.provider,
    locale,
    signal_assessment_available: signalAssessmentAvailable,
  };
}
export async function deleteData(db: D1Database, request: Request) {
  const owner = ownerHash(request);
  if (owner) {
    const sessions = (await hasResultClaimsSchema(db))
      ? db
          .prepare(
            'DELETE FROM web_sessions WHERE owner_hash=? AND NOT EXISTS (SELECT 1 FROM web_results r JOIN result_claims c ON c.result_id=r.id WHERE r.session_id=web_sessions.id)',
          )
          .bind(owner)
      : db.prepare('DELETE FROM web_sessions WHERE owner_hash=?').bind(owner);
    await db.batch([
      sessions,
      db
        .prepare(
          'DELETE FROM web_visitors WHERE owner_hash=? AND NOT EXISTS (SELECT 1 FROM web_sessions WHERE owner_hash=?)',
        )
        .bind(owner, owner),
    ]);
  }
  return { deleted: true };
}
export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
export async function shareResult(
  db: D1Database,
  request: Request,
  id: string,
) {
  const input = z
    .strictObject({
      include_name: z.boolean(),
      top_count: z.union([z.literal(1), z.literal(2)]),
      locale: z.enum(['en', 'es']).optional(),
    })
    .parse(await readJson(request));
  const result = await getResult(db, request, id);
  const locale = input.locale ?? result.locale;
  const shareInterpretation = deterministicInterpretation(
    result.profile,
    locale,
  ).interpretation;
  const projection = createPublicProjection(result.profile, {
    includeName: input.include_name,
    topCount: input.top_count,
    quote: shareInterpretation.social.quote,
    imageUrl: new URL(
      archetypeImage(
        result.profile.archetypes.primary.slug,
        result.profile.user.character_gender,
      ),
      request.url,
    ).href,
    locale,
  });
  const shareId = Buffer.from(randomBytes(24)).toString('hex');
  await db
    .prepare(
      'INSERT INTO web_shares(id,result_id,projection_json,created_at) SELECT ?,id,?,? FROM web_results WHERE id=? ON CONFLICT(result_id) DO UPDATE SET projection_json=excluded.projection_json',
    )
    .bind(shareId, JSON.stringify(projection), Date.now(), id)
    .run();
  const row = await db
    .prepare('SELECT id FROM web_shares WHERE result_id=?')
    .bind(id)
    .first<{ id: string }>();
  if (!row) throw new WebError(404, 'The result was deleted.');
  return { url: new URL(`/share/${row.id}`, request.url).href };
}
export async function revokeShare(
  db: D1Database,
  request: Request,
  id: string,
) {
  await getResult(db, request, id);
  await db.prepare('DELETE FROM web_shares WHERE result_id=?').bind(id).run();
  return { revoked: true };
}
export async function getOwnedShare(
  db: D1Database,
  request: Request,
  id: string,
) {
  await getResult(db, request, id);
  const row = await db
    .prepare('SELECT id,projection_json FROM web_shares WHERE result_id=?')
    .bind(id)
    .first<{ id: string; projection_json: string }>();
  if (!row)
    return {
      url: null,
      include_name: false,
      top_count: 2,
      locale: localeFromRequest(request),
    };
  const projection = readPublicProjection(JSON.parse(row.projection_json));
  return {
    url: new URL(`/share/${row.id}`, request.url).href,
    include_name: projection.display_name !== null,
    top_count: projection.archetypes.length,
    locale: projection.locale,
  };
}
export async function getShare(db: D1Database, id: string) {
  const row = await db
    .prepare(
      'SELECT s.projection_json,r.profile_json FROM web_shares s JOIN web_results r ON r.id=s.result_id WHERE s.id=?',
    )
    .bind(id)
    .first<{ projection_json: string; profile_json: string }>();
  if (!row)
    throw new WebError(404, 'This shared story is no longer available.');
  const stored = readPublicProjection(JSON.parse(row.projection_json));
  const profile = refreshArchetypePercentages(JSON.parse(row.profile_json));
  return publicResultSchema.parse({
    ...stored,
    archetypes: profile.archetypes.all
      .slice(0, stored.archetypes.length)
      .map((archetype) => ({
        name: archetypeName(archetype.slug, archetype.name, stored.locale),
        percentage: archetype.normalized_percentage,
      })),
    title: localizedCharacterTitle(profile, stored.locale),
  });
}
