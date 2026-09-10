import { redirect } from 'next/navigation';
import { DEFAULT_JOURNEY_SLUG } from '@/src/domain/journeys/registry';

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const restart = (await searchParams).new === '1' ? '?new=1' : '';
  redirect(`/journey/${DEFAULT_JOURNEY_SLUG}/start${restart}`);
}
