import { JourneyCatalog } from '@/components/journey/catalog';
import { listJourneyCards } from '@/src/domain/journeys/registry';

export default function JourneysPage() {
  return <JourneyCatalog journeys={listJourneyCards()} />;
}
