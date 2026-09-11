import { api, database, json } from '@/lib/server-api';
import { requestMagicLink } from '@/src/auth/service';

export async function POST(request: Request) {
  return api(
    request,
    async () => json(await requestMagicLink(database(), request)),
    true,
  );
}
