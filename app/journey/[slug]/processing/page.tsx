import { notFound } from 'next/navigation';
import { JourneyProcessing } from '@/components/journey/processing';
import { getJourneyManifest } from '@/src/domain/journeys/registry';

export default async function JourneyProcessingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const manifest = getJourneyManifest((await params).slug);
  if (!manifest || manifest.status !== 'published') notFound();
  return (
    <JourneyProcessing
      journeySlug={manifest.slug}
      processingAsset={manifest.assets.processing}
    />
  );
}
