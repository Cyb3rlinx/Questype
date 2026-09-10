import { JourneyCatalog } from '@/components/journey/catalog';
import { listJourneyManifests } from '@/src/domain/journeys/registry';

export default function JourneysPage() {
  const journeys = listJourneyManifests()
    .filter((manifest) => manifest.status !== 'retired')
    .map((manifest) => ({
      id: manifest.id,
      slug: manifest.slug,
      status: manifest.status,
      access: manifest.access,
      title: manifest.title,
      shortDescription: manifest.shortDescription,
      sceneCount: manifest.sceneCount,
      estimatedMinutes: manifest.estimatedMinutes,
    }));
  return <JourneyCatalog journeys={journeys} />;
}
