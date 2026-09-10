import { notFound } from 'next/navigation';
import { JourneyPlayer } from '@/components/journey/player';
import { getJourneyManifest } from '@/src/domain/journeys/registry';

export default async function JourneyPlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const manifest = getJourneyManifest((await params).slug);
  if (!manifest || manifest.status !== 'published') notFound();
  return <JourneyPlayer journeySlug={manifest.slug} />;
}
