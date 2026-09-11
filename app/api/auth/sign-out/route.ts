import { api, database, json } from '@/lib/server-api';
import { clearAuthCookie, signOut } from '@/src/auth/service';

export async function POST(request: Request) {
  return api(
    request,
    async () =>
      json(await signOut(database(), request), 200, {
        'Set-Cookie': clearAuthCookie(request),
      }),
    true,
  );
}
