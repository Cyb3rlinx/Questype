import type {
  JourneyDefinition,
  JourneyPublicManifest,
} from './contracts.js';
import { unwrittenRoadManifest } from './the-unwritten-road/manifest.js';
import { councilOfRealmsManifest } from './council-of-realms/manifest.js';
import { stormboundPassageManifest } from './stormbound-passage/manifest.js';
import type { DraftJourneyServerModel } from './draft-contracts.js';
export {
  DEFAULT_JOURNEY_SLUG,
  listJourneyCards,
  listJourneyManifests,
  listPublicJourneys,
} from './public-registry.js';

const definitions: readonly JourneyDefinition[] = [
  {
    manifest: unwrittenRoadManifest,
    loadServerModel: async () =>
      (await import('./the-unwritten-road/scoring.server.js'))
        .unwrittenRoadServerModel,
  },
  {
    manifest: councilOfRealmsManifest,
    loadDraftModel: async () =>
      (await import('./council-of-realms/signals.server.js'))
        .councilOfRealmsServerModel,
  },
  {
    manifest: stormboundPassageManifest,
    loadDraftModel: async () =>
      (await import('./stormbound-passage/signals.server.js'))
        .stormboundPassageServerModel,
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

export async function loadDraftJourneyModel(
  slug: string,
): Promise<DraftJourneyServerModel | null> {
  const definition = getJourneyDefinition(slug);
  return definition?.loadDraftModel ? definition.loadDraftModel() : null;
}
