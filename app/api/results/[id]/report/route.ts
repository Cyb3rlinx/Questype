import { api, database, json } from '@/lib/server-api';
import { getResult } from '@/src/application/web-service';
import { generateReportData } from '@/src/reports/data';
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
        new URL('/images/valley-wide.webp', request.url).href,
      ),
    );
  });
}
