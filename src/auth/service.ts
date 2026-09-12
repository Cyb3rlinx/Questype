import { randomBytes, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';
import {
  WebError,
  cookieValue,
  hashOpaqueToken,
  ownerHash,
  readJson,
} from '../application/http.js';
import { localeFromRequest, type Locale } from '../i18n/locale.js';
import type { MagicLinkEmailProvider } from './email-provider.js';
import { createProfileSnapshot } from '../profile/service.js';

export const AUTH_COOKIE = 'questype_auth';
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const REQUEST_WINDOW_MS = 10 * 60 * 1000;
const REQUEST_LIMIT = 5;

interface AuthUserRow {
  id: string;
  email: string;
  display_name: string | null;
  locale: Locale;
  created_at: number;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  locale: Locale;
  createdAt: number;
}

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

function opaqueToken(): string {
  return Buffer.from(randomBytes(32)).toString('base64url');
}

function isLocalRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function authCookie(request: Request, token: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearAuthCookie(request: Request): string {
  return authCookie(request, '', 0);
}

async function hasAuthSchema(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='auth_sessions'",
    )
    .first<{ name: string }>();
  return row?.name === 'auth_sessions';
}

function toUser(row: AuthUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    locale: row.locale === 'es' ? 'es' : 'en',
    createdAt: row.created_at,
  };
}

export async function authenticatedUser(
  db: D1Database,
  request: Request,
): Promise<AuthUser | null> {
  const token = cookieValue(request, AUTH_COOKIE);
  if (
    !token ||
    !tokenSchema.safeParse(token).success ||
    !(await hasAuthSchema(db))
  )
    return null;
  const row = await db
    .prepare(
      'SELECT u.id,u.email,u.display_name,u.locale,u.created_at FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?',
    )
    .bind(hashOpaqueToken(token), Date.now())
    .first<AuthUserRow>();
  return row ? toUser(row) : null;
}

export async function requireAuthenticatedUser(
  db: D1Database,
  request: Request,
): Promise<AuthUser> {
  const user = await authenticatedUser(db, request);
  if (!user) throw new WebError(401, 'Sign in to continue.');
  return user;
}

export async function requestMagicLink(
  db: D1Database,
  request: Request,
  provider: MagicLinkEmailProvider | null = null,
) {
  if (!(await hasAuthSchema(db)))
    throw new WebError(503, 'Account sign-in is not available yet.');
  const input = z
    .strictObject({ email: emailSchema })
    .parse(await readJson(request));
  const now = Date.now();
  const locale = localeFromRequest(request);
  const local = isLocalRequest(request);
  if (!provider && !local)
    throw new WebError(503, 'Email sign-in is not configured yet.');

  const recent = await db
    .prepare(
      'SELECT COUNT(*) AS total FROM auth_magic_links WHERE email=? AND requested_at>?',
    )
    .bind(input.email, now - REQUEST_WINDOW_MS)
    .first<{ total: number }>();
  if ((recent?.total ?? 0) >= REQUEST_LIMIT)
    return { accepted: true, expires_in_minutes: 15 };

  const token = opaqueToken();
  const linkId = randomUUID();
  const expiresAt = now + MAGIC_LINK_TTL_MS;
  const verifyUrl = new URL('/auth/verify', request.url);
  verifyUrl.searchParams.set('token', token);
  await db.batch([
    db
      .prepare(
        'DELETE FROM auth_magic_links WHERE expires_at<? AND requested_at<?',
      )
      .bind(now, now - 24 * 60 * 60 * 1000),
    db
      .prepare(
        'INSERT INTO auth_magic_links(id,email,token_hash,expires_at,consumed_at,consumed_nonce,requested_at) VALUES (?,?,?,?,NULL,NULL,?)',
      )
      .bind(linkId, input.email, hashOpaqueToken(token), expiresAt, now),
  ]);

  if (provider)
    await provider.sendMagicLink({
      to: input.email,
      verifyUrl: verifyUrl.href,
      expiresAt,
      locale,
    });

  return {
    accepted: true,
    expires_in_minutes: 15,
    ...(local ? { development_verify_url: verifyUrl.href } : {}),
  };
}

export async function verifyMagicLink(db: D1Database, request: Request) {
  const input = z
    .strictObject({ token: tokenSchema })
    .parse(await readJson(request));
  const now = Date.now();
  const tokenHash = hashOpaqueToken(input.token);
  const consumeNonce = randomUUID();
  const sessionId = randomUUID();
  const sessionToken = opaqueToken();
  const userId = randomUUID();
  const locale = localeFromRequest(request);
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const operations = await db.batch([
    db
      .prepare(
        'UPDATE auth_magic_links SET consumed_at=?,consumed_nonce=? WHERE token_hash=? AND consumed_at IS NULL AND expires_at>=?',
      )
      .bind(now, consumeNonce, tokenHash, now),
    db
      .prepare(
        'INSERT INTO auth_users(id,email,display_name,locale,created_at,updated_at) SELECT ?,email,NULL,?,?,? FROM auth_magic_links WHERE token_hash=? AND consumed_nonce=? ON CONFLICT(email) DO UPDATE SET updated_at=excluded.updated_at',
      )
      .bind(userId, locale, now, now, tokenHash, consumeNonce),
    db
      .prepare(
        'INSERT INTO auth_sessions(id,user_id,token_hash,expires_at,created_at,last_seen_at) SELECT ?,u.id,?,?,?,? FROM auth_users u JOIN auth_magic_links m ON m.email=u.email WHERE m.token_hash=? AND m.consumed_nonce=?',
      )
      .bind(
        sessionId,
        hashOpaqueToken(sessionToken),
        expiresAt,
        now,
        now,
        tokenHash,
        consumeNonce,
      ),
  ]);
  if ((operations[0]?.meta.changes ?? 0) !== 1)
    throw new WebError(
      409,
      'This sign-in link is invalid, expired or already used.',
    );
  const user = await db
    .prepare(
      'SELECT u.id,u.email,u.display_name,u.locale,u.created_at FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.id=?',
    )
    .bind(sessionId)
    .first<AuthUserRow>();
  if (!user)
    throw new WebError(503, 'The account session could not be created.');
  return {
    data: { signed_in: true, user: toUser(user) },
    cookie: authCookie(request, sessionToken, SESSION_TTL_SECONDS),
  };
}

export async function signOut(db: D1Database, request: Request) {
  const token = cookieValue(request, AUTH_COOKIE);
  if (token && tokenSchema.safeParse(token).success)
    await db
      .prepare('DELETE FROM auth_sessions WHERE token_hash=?')
      .bind(hashOpaqueToken(token))
      .run();
  return { signed_out: true };
}

export async function accountOverview(db: D1Database, request: Request) {
  const user = await requireAuthenticatedUser(db, request);
  const counts = await db
    .prepare(
      'SELECT COUNT(*) AS results,COUNT(DISTINCT j.id) AS journeys FROM result_claims c JOIN web_results r ON r.id=c.result_id JOIN web_sessions s ON s.id=r.session_id LEFT JOIN journeys j ON j.id=s.journey_id WHERE c.user_id=?',
    )
    .bind(user.id)
    .first<{ results: number; journeys: number }>();
  return {
    user,
    results: counts?.results ?? 0,
    journeys: counts?.journeys ?? 0,
  };
}

export async function updateAccount(db: D1Database, request: Request) {
  const user = await requireAuthenticatedUser(db, request);
  const input = z
    .strictObject({
      display_name: z.string().trim().min(1).max(80).nullable(),
      locale: z.enum(['en', 'es']),
    })
    .parse(await readJson(request));
  await db
    .prepare(
      'UPDATE auth_users SET display_name=?,locale=?,updated_at=? WHERE id=?',
    )
    .bind(input.display_name, input.locale, Date.now(), user.id)
    .run();
  return accountOverview(db, request);
}

export async function claimAnonymousResults(db: D1Database, request: Request) {
  const user = await requireAuthenticatedUser(db, request);
  const owner = ownerHash(request);
  if (!owner)
    throw new WebError(409, 'No anonymous journey is available to claim.');
  const before = await db
    .prepare(
      'SELECT COUNT(*) AS eligible,SUM(CASE WHEN c.user_id=? THEN 1 ELSE 0 END) AS already_owned,SUM(CASE WHEN c.user_id IS NOT NULL AND c.user_id<>? THEN 1 ELSE 0 END) AS conflicts FROM web_results r JOIN web_sessions s ON s.id=r.session_id LEFT JOIN result_claims c ON c.result_id=r.id WHERE s.owner_hash=?',
    )
    .bind(user.id, user.id, owner)
    .first<{
      eligible: number;
      already_owned: number | null;
      conflicts: number | null;
    }>();
  const inserted = await db
    .prepare(
      'INSERT OR IGNORE INTO result_claims(result_id,user_id,claimed_owner_hash,claimed_at) SELECT r.id,?,?,? FROM web_results r JOIN web_sessions s ON s.id=r.session_id WHERE s.owner_hash=?',
    )
    .bind(user.id, owner, Date.now(), owner)
    .run();
  await createProfileSnapshot(db, user.id);
  return {
    claimed: inserted.meta.changes ?? 0,
    already_owned: before?.already_owned ?? 0,
    conflicts: before?.conflicts ?? 0,
    eligible: before?.eligible ?? 0,
  };
}

export async function deleteAccount(db: D1Database, request: Request) {
  const user = await requireAuthenticatedUser(db, request);
  await db.batch([
    db
      .prepare(
        'DELETE FROM web_sessions WHERE id IN (SELECT r.session_id FROM web_results r JOIN result_claims c ON c.result_id=r.id WHERE c.user_id=?)',
      )
      .bind(user.id),
    db.prepare('DELETE FROM auth_magic_links WHERE email=?').bind(user.email),
    db.prepare('DELETE FROM auth_users WHERE id=?').bind(user.id),
    db.prepare(
      'DELETE FROM web_visitors WHERE NOT EXISTS (SELECT 1 FROM web_sessions s WHERE s.owner_hash=web_visitors.owner_hash)',
    ),
  ]);
  return { deleted: true };
}
