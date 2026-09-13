import type { Locale } from '../../i18n/locale.js';
import type {
  JourneyCardData,
  JourneyPublicManifest,
  PublicJourneySummary,
} from './contracts.js';
import { councilOfRealmsManifest } from './council-of-realms/manifest.js';
import { stormboundPassageManifest } from './stormbound-passage/manifest.js';
import { unwrittenRoadManifest } from './the-unwritten-road/manifest.js';

export const DEFAULT_JOURNEY_SLUG = unwrittenRoadManifest.slug;

const manifests: readonly JourneyPublicManifest[] = [
  unwrittenRoadManifest,
  councilOfRealmsManifest,
  stormboundPassageManifest,
];

export function listJourneyManifests(): readonly JourneyPublicManifest[] {
  return manifests;
}

export function listPublicJourneys(locale: Locale): PublicJourneySummary[] {
  return manifests
    .map((manifest) => ({
      id: manifest.id,
      slug: manifest.slug,
      status: manifest.status,
      access: manifest.access,
      currentVersion: manifest.currentVersion,
      title: manifest.title[locale],
      shortDescription: manifest.shortDescription[locale],
      assessmentFocus: manifest.assessmentFocus[locale],
      tags: manifest.tags[locale],
      sceneCount: manifest.sceneCount,
      actCount: manifest.actCount,
      estimatedMinutes: manifest.estimatedMinutes,
    }))
    .filter((journey) => journey.status !== 'retired');
}

export function listJourneyCards(): JourneyCardData[] {
  return manifests
    .map((manifest) => ({
      id: manifest.id,
      slug: manifest.slug,
      status: manifest.status,
      access: manifest.access,
      title: manifest.title,
      shortDescription: manifest.shortDescription,
      assessmentFocus: manifest.assessmentFocus,
      tags: manifest.tags,
      sceneCount: manifest.sceneCount,
      estimatedMinutes: manifest.estimatedMinutes,
      image: manifest.assets.onboarding,
    }))
    .filter((journey) => journey.status !== 'retired');
}
