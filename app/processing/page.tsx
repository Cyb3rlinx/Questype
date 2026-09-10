import { redirect } from 'next/navigation';
import { DEFAULT_JOURNEY_SLUG } from '@/src/domain/journeys/registry';

export default function ProcessingPage() {
  redirect(`/journey/${DEFAULT_JOURNEY_SLUG}/processing`);
}
