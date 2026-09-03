import { api, database, json } from '@/lib/server-api';
import { submitAnswer } from '@/src/application/web-service';
export async function POST(request: Request) {
  return api(
    request,
    async () => json(await submitAnswer(database(), request)),
    true,
  );
}
