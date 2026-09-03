import { env } from 'cloudflare:workers';
import { ZodError } from 'zod';
import { WebError, guardMutation } from '@/src/application/web-service';
export function database() {
  if (!env.DB)
    throw new WebError(
      503,
      'The journey is temporarily unavailable. Please try again shortly.',
    );
  return env.DB;
}
export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}
export async function api(
  request: Request,
  work: () => Promise<Response>,
  mutation = false,
) {
  try {
    if (mutation) guardMutation(request);
    return await work();
  } catch (error) {
    if (error instanceof WebError)
      return json({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return json({ error: 'Please check your details and try again.' }, 400);
    console.error(
      'journey_request_failed',
      error instanceof Error ? error.name : 'UnknownError',
    );
    return json(
      {
        error:
          'The path is temporarily unavailable. Your saved choices are safe. Please try again.',
      },
      503,
    );
  }
}
