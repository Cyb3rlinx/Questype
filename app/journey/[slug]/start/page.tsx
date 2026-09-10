import { notFound } from 'next/navigation';
import { Onboarding } from '@/components/journey/onboarding';
import { getJourneyManifest } from '@/src/domain/journeys/registry';

export default async function JourneyStartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const manifest = getJourneyManifest((await params).slug);
  if (!manifest || manifest.status !== 'published') notFound();
  return (
    <Onboarding
      journeySlug={manifest.slug}
      sceneCount={manifest.sceneCount}
      onboardingAsset={manifest.assets.onboarding}
    />
  );
}
