import { api, database, json } from '@/lib/server-api';
import { verifyMagicLink } from '@/src/auth/service';

export async function POST(request: Request) {
  return api(
    request,
    async () => {
      const result = await verifyMagicLink(database(), request);
      return json(result.data, 200, { 'Set-Cookie': result.cookie });
    },
    true,
  );
}
