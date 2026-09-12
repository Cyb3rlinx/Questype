import { api, database, json } from '@/lib/server-api';
import { requireAuthenticatedUser } from '@/src/auth/service';
import { accumulatedProfile } from '@/src/profile/service';
import { generateProfileReport } from '@/src/profile/report';
import { localeFromRequest } from '@/src/i18n/locale';
import { WebError } from '@/src/application/http';

export async function GET(request: Request) {
  return api(request, async () => {
    const db = database();
    const user = await requireAuthenticatedUser(db, request);
    const locale = localeFromRequest(request);
    const view = await accumulatedProfile(db, user, locale);
    if (!view.snapshot)
      throw new WebError(
        409,
        'Complete and claim a Journey before creating a profile report.',
      );
    return json(generateProfileReport(view, locale));
  });
}
