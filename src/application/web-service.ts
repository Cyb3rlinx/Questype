import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';
import { journeyV1 } from '../domain/content/journey-v1.js';
import {
  createSession,
  restoreSession,
  acceptAnswer,
  markSessionCompleted,
  toPublicScene,
  type JourneySession,
} from '../domain/journey/session.js';
import { createScoringEngine } from '../domain/scoring/engine.js';
import {
  generateStructuredProfile,
  structuredProfileSchema,
} from '../domain/scoring/profile.js';
import { deterministicInterpretation } from '../ai/fallback.js';
import { validateInterpretation } from '../ai/contracts.js';
import { contentHash } from '../database/content-hash.js';
import {
  createPublicProjection,
  publicResultSchema,
} from '../sharing/contracts.js';
import { userIdentitySchema } from '../domain/types.js';

const engine = createScoringEngine(journeyV1);
const hash = contentHash(journeyV1);
const releaseId = `${journeyV1.id}:${journeyV1.journey_version}:${journeyV1.scoring_version}`;
const COOKIE = 'archetype_visitor';
interface SessionRow {
  id: string;
  owner_hash: string;
  release_id: string;
  state_json: string;
  revision: number;
  status: string;
  current_scene: number;
  created_at: number;
  result_id?: string | null;
}
export class WebError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function ownerHash(request: Request): string | null {
  const token = request.headers
    .get('cookie')
    ?.split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token)
    ? createHash('sha256').update(token).digest('hex')
    : null;
}
export function guardMutation(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin)
    throw new WebError(403, 'This request must come from your journey page.');
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new WebError(403, 'Cross-site requests are not allowed.');
}
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new WebError(415, 'Expected a JSON request.');
  const reader = request.body?.getReader();
  if (!reader) throw new WebError(400, 'The request was empty.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 4096) {
      await reader.cancel();
      throw new WebError(413, 'The request is too large.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new WebError(400, 'The request could not be read.');
  }
}
async function release(db: D1Database) {
  await db
    .prepare(
      'INSERT INTO web_releases(id,content_hash,snapshot,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING',
    )
    .bind(releaseId, hash, JSON.stringify(journeyV1), Date.now())
    .run();
  const row = await db
    .prepare('SELECT content_hash FROM web_releases WHERE id=?')
    .bind(releaseId)
    .first<{ content_hash: string }>();
  if (row?.content_hash !== hash)
    throw new WebError(
      409,
      'This story release has changed. Your previous progress remains saved.',
    );
}
function state(row: SessionRow) {
  if (row.release_id !== releaseId)
    throw new WebError(409, 'This journey uses an earlier story release.');
  return restoreSession(journeyV1, JSON.parse(row.state_json));
}
export async function findSession(
  db: D1Database,
  owner: string | null,
  id?: string,
) {
  if (!owner) throw new WebError(404, 'No saved journey on this browser yet.');
  const row = await db
    .prepare(
      `SELECT s.*,r.id AS result_id FROM web_sessions s LEFT JOIN web_results r ON r.session_id=s.id WHERE s.owner_hash=? ${id ? 'AND s.id=?' : ''} ORDER BY s.created_at DESC,s.id DESC LIMIT 1`,
    )
    .bind(...(id ? [owner, id] : [owner]))
    .first<SessionRow>();
  if (!row)
    throw new WebError(404, 'This journey could not be found on this browser.');
  return row;
}
function sessionView(row: SessionRow) {
  const saved = state(row);
  return {
    id: row.id,
    name: saved.user.name,
    character_gender: saved.user.character_gender,
    status: saved.status,
    current_scene: saved.current_scene,
    completed_scenes: saved.answers.length,
    total_scenes: journeyV1.scenes.length,
    result_id: row.result_id ?? null,
    scene:
      saved.status === 'in_progress'
        ? toPublicScene(
            journeyV1.scenes[saved.answers.length]!,
            saved.user.character_gender,
          )
        : null,
  };
}
export async function getSession(db: D1Database, request: Request) {
  return sessionView(await findSession(db, ownerHash(request)));
}
export async function startSession(db: D1Database, request: Request) {
  const input = z
    .strictObject({
      name: z.string().trim().max(60),
      character_gender: z.enum(['man', 'woman']),
      request_id: z.uuid(),
      restart: z.boolean().optional(),
    })
    .parse(await readJson(request));
  let owner = ownerHash(request);
  let cookie: string | null = null;
  if (owner && !input.restart) {
    try {
      const existing = await findSession(db, owner);
      if (state(existing).status !== 'completed')
        return { data: sessionView(existing), cookie };
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
  await release(db);
  const saved = createSession(
    journeyV1,
    userIdentitySchema.parse({
      name: input.name || null,
      character_gender: input.character_gender,
    }),
    { id: input.request_id, started_at: new Date().toISOString() },
  );
  await db.batch([
    db
      .prepare(
        'INSERT INTO web_visitors(owner_hash,created_at) VALUES (?,?) ON CONFLICT(owner_hash) DO NOTHING',
      )
      .bind(owner, Date.now()),
    db
      .prepare(
        'INSERT INTO web_sessions(id,owner_hash,release_id,state_json,revision,status,current_scene,created_at) VALUES (?,?,?,?,0,?,?,?) ON CONFLICT(id) DO NOTHING',
      )
      .bind(
        saved.id,
        owner,
        releaseId,
        JSON.stringify(saved),
        saved.status,
        saved.current_scene,
        Date.now(),
      ),
  ]);
  return { data: sessionView(await findSession(db, owner, saved.id)), cookie };
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
  const row = await findSession(db, owner, input.session_id);
  const before = state(row);
  let next: JourneySession;
  try {
    next = acceptAnswer(journeyV1, before, {
      scene_id: input.scene_id,
      choice_id: input.choice_id,
    });
  } catch (e) {
    throw new WebError(
      409,
      e instanceof Error ? e.message : 'Your journey changed in another tab.',
    );
  }
  if (next.answers.length === before.answers.length) return sessionView(row);
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
    db
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
      ),
  ]);
  const current = await findSession(db, owner, row.id);
  const accepted = state(current).answers.find(
    (a) => a.scene_id === input.scene_id,
  );
  if (accepted?.choice_id !== input.choice_id)
    throw new WebError(
      409,
      'A different choice was saved in another tab. Refresh to continue your story.',
    );
  return sessionView(current);
}
export async function completeJourney(db: D1Database, request: Request) {
  const input = z
    .strictObject({ session_id: z.uuid() })
    .parse(await readJson(request));
  const owner = ownerHash(request);
  const row = await findSession(db, owner, input.session_id);
  if (row.result_id) return { result_id: row.result_id };
  const saved = state(row);
  if (saved.status !== 'processing')
    throw new WebError(
      409,
      'Complete all fifteen moments before revealing your result.',
    );
  const id = randomUUID(),
    now = new Date().toISOString();
  const profile = generateStructuredProfile(engine, saved.answers, saved.user, {
    id,
    created_at: now,
    content_hash: hash,
  });
  const interpretation = deterministicInterpretation(profile);
  const completed = markSessionCompleted(journeyV1, saved, now);
  await db.batch([
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
    db
      .prepare(
        "UPDATE web_sessions SET state_json=?,status='completed',revision=revision+1 WHERE id=? AND owner_hash=? AND revision=? AND EXISTS(SELECT 1 FROM web_results WHERE session_id=?)",
      )
      .bind(JSON.stringify(completed), row.id, owner, row.revision, row.id),
  ]);
  const final = await findSession(db, owner, row.id);
  if (!final.result_id)
    throw new WebError(
      409,
      'Your journey changed. Please try revealing it again.',
    );
  return { result_id: final.result_id };
}
export async function getResult(db: D1Database, request: Request, id: string) {
  const row = await db
    .prepare(
      'SELECT r.profile_json,r.interpretation_json FROM web_results r JOIN web_sessions s ON s.id=r.session_id WHERE r.id=? AND s.owner_hash=?',
    )
    .bind(id, ownerHash(request) ?? '')
    .first<{ profile_json: string; interpretation_json: string }>();
  if (!row)
    throw new WebError(
      404,
      'This result is private or is no longer available.',
    );
  const profile = structuredProfileSchema.parse(JSON.parse(row.profile_json));
  const stored = JSON.parse(row.interpretation_json) as ReturnType<
    typeof deterministicInterpretation
  >;
  return {
    profile,
    interpretation: validateInterpretation(stored.interpretation, profile),
    interpretation_provider: stored.provider,
  };
}
export async function deleteData(db: D1Database, request: Request) {
  const owner = ownerHash(request);
  if (owner)
    await db
      .prepare('DELETE FROM web_visitors WHERE owner_hash=?')
      .bind(owner)
      .run();
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
      top_count: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    })
    .parse(await readJson(request));
  const result = await getResult(db, request, id);
  const projection = createPublicProjection(result.profile, {
    includeName: input.include_name,
    topCount: input.top_count,
    quote: result.interpretation.social.quote,
    imageUrl: new URL('/images/valley-wide.webp', request.url).href,
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
  if (!row) return { url: null, include_name: false, top_count: 3 };
  const projection = publicResultSchema.parse(JSON.parse(row.projection_json));
  return {
    url: new URL(`/share/${row.id}`, request.url).href,
    include_name: projection.display_name !== null,
    top_count: projection.archetypes.length,
  };
}
export async function getShare(db: D1Database, id: string) {
  const row = await db
    .prepare('SELECT projection_json FROM web_shares WHERE id=?')
    .bind(id)
    .first<{ projection_json: string }>();
  if (!row)
    throw new WebError(404, 'This shared story is no longer available.');
  return publicResultSchema.parse(JSON.parse(row.projection_json));
}
