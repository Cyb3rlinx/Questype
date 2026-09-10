import type { Locale } from '../../i18n/locale.js';
import type {
  JourneyDefinition,
  JourneyPublicManifest,
  PublicJourneySummary,
} from './contracts.js';
import { unwrittenRoadManifest } from './the-unwritten-road/manifest.js';

export const DEFAULT_JOURNEY_SLUG = unwrittenRoadManifest.slug;

const definitions: readonly JourneyDefinition[] = [
  {
    manifest: unwrittenRoadManifest,
    loadServerModel: async () =>
      (await import('./the-unwritten-road/scoring.server.js'))
        .unwrittenRoadServerModel,
  },
];

const bySlug = new Map(
  definitions.map((definition) => [definition.manifest.slug, definition]),
);
const byId = new Map(
  definitions.map((definition) => [definition.manifest.id, definition]),
);
const byLegacyContentId = new Map(
  definitions.map((definition) => [
    definition.manifest.legacyContentId,
    definition,
  ]),
);

export function getJourneyDefinition(slug: string): JourneyDefinition | null {
  return bySlug.get(slug) ?? null;
}

export function getJourneyDefinitionById(id: string): JourneyDefinition | null {
  return byId.get(id) ?? byLegacyContentId.get(id) ?? null;
}

export function requireJourneyDefinition(slug: string): JourneyDefinition {
  const definition = getJourneyDefinition(slug);
  if (!definition) throw new Error(`Unknown journey: ${slug}`);
  return definition;
}

export function getJourneyManifest(slug: string): JourneyPublicManifest | null {
  return getJourneyDefinition(slug)?.manifest ?? null;
}

export function listJourneyManifests(): readonly JourneyPublicManifest[] {
  return definitions.map((definition) => definition.manifest);
}

export function listPublicJourneys(locale: Locale): PublicJourneySummary[] {
  return definitions
    .map(({ manifest }) => ({
      id: manifest.id,
      slug: manifest.slug,
      status: manifest.status,
      access: manifest.access,
      currentVersion: manifest.currentVersion,
      title: manifest.title[locale],
      shortDescription: manifest.shortDescription[locale],
      sceneCount: manifest.sceneCount,
      actCount: manifest.actCount,
      estimatedMinutes: manifest.estimatedMinutes,
    }))
    .filter((journey) => journey.status !== 'retired');
}
