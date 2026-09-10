import { journeyV1 } from '../../content/journey-v1.js';
import { contentHash } from '../../../database/content-hash.js';
import { createScoringEngine } from '../../scoring/engine.js';
import type { JourneyServerModel } from '../contracts.js';

const hash = contentHash(journeyV1);

export const unwrittenRoadServerModel: JourneyServerModel = {
  content: journeyV1,
  engine: createScoringEngine(journeyV1),
  contentHash: hash,
  legacyReleaseId: `${journeyV1.id}:${journeyV1.journey_version}:${journeyV1.scoring_version}`,
};
