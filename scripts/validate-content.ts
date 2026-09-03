import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { validateContent } from '../src/domain/content/validate.js';
import { contentHash } from '../src/database/content-hash.js';
const audit = validateContent(journeyV1);
console.log(JSON.stringify({ journey: journeyV1.title, scenes: journeyV1.scenes.length, choices: journeyV1.scenes.reduce((sum, s) => sum + s.choices.length, 0), archetypes: journeyV1.archetypes.length, dimensions: journeyV1.dimensions.length, content_hash: contentHash(journeyV1), ...audit }, null, 2));
if (audit.errors.length) process.exitCode = 1;
