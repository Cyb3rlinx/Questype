import { api, database, json } from '@/lib/server-api';
import {
  shareResult,
  revokeShare,
  getOwnedShare,
} from '@/src/application/web-service';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return api(request, async () =>
    json(await getOwnedShare(database(), request, (await params).id)),
  );
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return api(
    request,
    async () => json(await shareResult(database(), request, (await params).id)),
    true,
  );
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return api(
    request,
    async () => json(await revokeShare(database(), request, (await params).id)),
    true,
  );
}
