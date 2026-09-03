import { api, database, json } from '@/lib/server-api';
import { completeJourney } from '@/src/application/web-service';
export async function POST(request: Request) {
  return api(
    request,
    async () => json(await completeJourney(database(), request)),
    true,
  );
}
