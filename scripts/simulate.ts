import { mkdir, writeFile } from 'node:fs/promises';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { simulateJourneys } from '../src/domain/scoring/simulation.js';
import { contentHash } from '../src/database/content-hash.js';

const report = { ...simulateJourneys(journeyV1, Number(process.argv[2] ?? 10000), Number(process.argv[3] ?? 20260903)), content_hash: contentHash(journeyV1) };
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/balance-report.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
const lines = [
  '# Journey v1 mechanical balancing report', '',
  `Seed: ${report.seed}. Journeys: ${report.journeys.toLocaleString('en-US')}. Content hash: \`${report.content_hash}\`.`, '',
  report.caveat, '', report.normalization, '',
  '| Archetype | Positive options | Positive weight | Negative weight | Scenes | Primary | Secondary | Mean alignment |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...report.archetypes.map(r => `| ${r.archetype} | ${r.positive_opportunities} | ${r.positive_weight} | ${r.negative_weight} | ${r.scenes_with_signal} | ${r.primary_frequency.toFixed(2)}% | ${r.secondary_frequency.toFixed(2)}% | ${r.average_percentage.toFixed(2)}% |`),
  '', `Exact top ties: ${report.top_tie_count}. Constructive observed outcome witnesses: ${report.archetypes.filter(a => a.witness).length}/12. Full paths and calibration values are in balance-report.json.`,
  '', '## Findings', '', ...(report.errors.length ? report.errors.map(e => `- ERROR: ${e}`) : ['- No hard validation errors.']),
  ...(report.warnings.length ? report.warnings.map(w => `- WARNING: ${w}`) : ['- No configured opportunity or frequency warnings.']),
  '', 'Gender is absent from the scoring function inputs. Representation parity is also verified in profile tests. This is implementation parity, not a claim that different groups choose the same answers.',
  '', 'Human pilot testing, content review and provider-output safety review remain launch gates. A mechanically balanced seed is not a validated psychological instrument.', '',
];
await writeFile(new URL('../artifacts/BALANCE_REPORT.md', import.meta.url), lines.join('\n'));
console.table(report.archetypes.map(r => ({ archetype: r.archetype, opportunities: r.positive_opportunities, primary: r.primary_frequency.toFixed(2) + '%', secondary: r.secondary_frequency.toFixed(2) + '%', mean: r.average_percentage.toFixed(2) + '%' })));
console.log({ seed: report.seed, journeys: report.journeys, top_ties: report.top_tie_count, warnings: report.warnings, errors: report.errors });
if (report.errors.length) process.exitCode = 1;
