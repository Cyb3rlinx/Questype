import { api, database, json } from '@/lib/server-api';
import {
  accountOverview,
  clearAuthCookie,
  deleteAccount,
  updateAccount,
} from '@/src/auth/service';

export async function GET(request: Request) {
  return api(request, async () =>
    json(await accountOverview(database(), request)),
  );
}

export async function PATCH(request: Request) {
  return api(
    request,
    async () => json(await updateAccount(database(), request)),
    true,
  );
}

export async function DELETE(request: Request) {
  return api(
    request,
    async () =>
      json(await deleteAccount(database(), request), 200, {
        'Set-Cookie': clearAuthCookie(request),
      }),
    true,
  );
}
