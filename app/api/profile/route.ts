import { api, database, json } from '@/lib/server-api';
import { requireAuthenticatedUser } from '@/src/auth/service';
import { accumulatedProfile } from '@/src/profile/service';
import { localeFromRequest } from '@/src/i18n/locale';

export async function GET(request: Request) {
  return api(request, async () => {
    const db = database();
    const user = await requireAuthenticatedUser(db, request);
    return json(await accumulatedProfile(db, user, localeFromRequest(request)));
  });
}
