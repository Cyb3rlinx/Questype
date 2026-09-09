import { api, database, json } from '@/lib/server-api';
import { getResult } from '@/src/application/web-service';
import { generateReportData } from '@/src/reports/data';
import { archetypeImage } from '@/src/domain/archetype-images';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return api(request, async () => {
    const result = await getResult(database(), request, (await params).id);
    return json(
      generateReportData(
        result.profile,
        result.interpretation,
        new URL(archetypeImage(result.profile.archetypes.primary.slug, result.profile.user.character_gender), request.url).href,
        result.locale,
      ),
    );
  });
}
