import { api, database, json } from '@/lib/server-api';
import { getResult } from '@/src/application/web-service';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return api(request, async () =>
    json(await getResult(database(), request, (await params).id)),
  );
}
