import { createHash } from 'node:crypto';

const VISITOR_COOKIE = 'archetype_visitor';

export class WebError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function cookieValue(request: Request, name: string): string | null {
  const encoded = request.headers
    .get('cookie')
    ?.split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
  if (!encoded) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function ownerHash(request: Request): string | null {
  const token = cookieValue(request, VISITOR_COOKIE);
  return token && /^[a-f0-9]{64}$/.test(token) ? hashOpaqueToken(token) : null;
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
