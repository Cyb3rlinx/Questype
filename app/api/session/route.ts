import { api, database, json } from '@/lib/server-api';
import {
  getSession,
  startSession,
  deleteData,
  clearCookie,
} from '@/src/application/web-service';
export async function GET(request: Request) {
  return api(request, async () => json(await getSession(database(), request)));
}
export async function POST(request: Request) {
  return api(
    request,
    async () => {
      const result = await startSession(database(), request);
      return json(
        result.data,
        200,
        result.cookie ? { 'Set-Cookie': result.cookie } : {},
      );
    },
    true,
  );
}
export async function DELETE(request: Request) {
  return api(
    request,
    async () =>
      json(await deleteData(database(), request), 200, {
        'Set-Cookie': clearCookie,
      }),
    true,
  );
}
