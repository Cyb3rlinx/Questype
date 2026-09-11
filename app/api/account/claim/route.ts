import { api, database, json } from '@/lib/server-api';
import { claimAnonymousResults } from '@/src/auth/service';

export async function POST(request: Request) {
  return api(
    request,
    async () => json(await claimAnonymousResults(database(), request)),
    true,
  );
}
