import { mkdir, writeFile } from 'node:fs/promises';
import type {
  DraftJourneyContent,
  DraftJourneyServerModel,
} from '../src/domain/journeys/draft-contracts.js';
import { councilOfRealmsServerModel } from '../src/domain/journeys/council-of-realms/signals.server.js';
import { stormboundPassageServerModel } from '../src/domain/journeys/stormbound-passage/signals.server.js';
import {
  analyzeSignalCoverage,
  simulateSignalModel,
} from '../src/domain/signals/coverage.js';
import { draftSignalContent } from '../src/domain/journeys/draft-contracts.js';

const modelPairs = [
  {
    key: 'council',
    model: councilOfRealmsServerModel,
    storyboard:
      'docs/v2/journeys/COUNCIL_OF_REALMS_PSYCHOLOGICAL_STORYBOARD.md',
    coverage: 'docs/v2/journeys/COUNCIL_SIGNAL_COVERAGE.md',
    artifact: 'artifacts/council-signal-coverage.json',
  },
  {
    key: 'stormbound',
    model: stormboundPassageServerModel,
    storyboard:
      'docs/v2/journeys/STORMBOUND_PASSAGE_PSYCHOLOGICAL_STORYBOARD.md',
    coverage: 'docs/v2/journeys/STORMBOUND_SIGNAL_COVERAGE.md',
    artifact: 'artifacts/stormbound-signal-coverage.json',
  },
] as const;

function list(values: readonly string[]) {
  return values.length ? values.map((value) => `\`${value}\``).join(', ') : '—';
}

function sceneStoryboard(
  content: DraftJourneyContent,
  model: DraftJourneyServerModel,
) {
  return content.scenes
    .map((scene) => {
      const decisions = scene.choices
        .map((choice, index) => {
          const evidence = model.signalModel.choiceEvidence[choice.id] ?? [];
          const intent = evidence
            .map(
              (entry) =>
                `${entry.direction > 0 ? '+' : '−'} ${entry.signal}/${entry.facet} @ ${entry.context}`,
            )
            .join('; ');
          return `${index + 1}. **${choice.text.en} / ${choice.text.es}**  
   Benefit / Beneficio: ${choice.benefit.en} / ${choice.benefit.es}  
   Cost / Costo: ${choice.tradeoff.en} / ${choice.tradeoff.es}  
   Internal evidence intent: ${intent}`;
        })
        .join('\n');
      return `## ${String(scene.order).padStart(2, '0')} · ${scene.title.en} / ${scene.title.es}

- **Scene ID:** \`${scene.id}\`
- **Act / Acto:** ${scene.act} · ${content.acts[scene.act - 1]!.en} / ${content.acts[scene.act - 1]!.es}
- **Narrative purpose / Propósito narrativo:** ${scene.narrativePurpose.en} / ${scene.narrativePurpose.es}
- **Psychological purpose / Propósito psicológico:** ${scene.psychologicalPurpose.en} / ${scene.psychologicalPurpose.es}
- **Primary signals / Señales primarias:** ${list(scene.primarySignals)}
- **Secondary signals / Señales secundarias:** ${list(scene.secondarySignals)}
- **Facets / Facetas:** ${list(scene.facets)}
- **Context IDs:** ${list(scene.contexts)}
- **Pressure-sensitive / Sensible a presión:** ${scene.isPressure ? 'Yes / Sí' : 'No'}
- **Social-desirability risk / Riesgo de deseabilidad social:** ${scene.socialDesirabilityRisk.en} / ${scene.socialDesirabilityRisk.es}
- **Potential confounds / Posibles confusores:** ${scene.constructConfounds.en} / ${scene.constructConfounds.es}
- **Visual placeholder / Concepto visual:** ${scene.visualConcept.en} / ${scene.visualConcept.es}
- **Continuity / Continuidad:** ${scene.continuityNotes.en} / ${scene.continuityNotes.es}

**Narrative / Narrativa**

EN: ${scene.narrative.en}

ES: ${scene.narrative.es}

**Candidate decisions / Decisiones candidatas**

${decisions}
`;
    })
    .join('\n');
}

function storyboardDocument(model: DraftJourneyServerModel) {
  const content = model.content;
  return `# ${content.title.en} / ${content.title.es} — Psychological Storyboard

**Status:** Draft content architecture; not publicly playable  
**Journey version:** \`${content.journeyVersion}\`  
**Scoring version:** \`${content.scoringVersion}\`  
**Content hash:** \`${model.contentHash}\`  
**Structure:** ${content.scenes.length} fixed-order scenes, ${content.acts.length} acts, four strategies per scene

## Narrative and measurement rules

- Every traveler reaches the same scenes in the same order. Choices produce evidence, never side quests.
- Every option has a plausible benefit and cost. Directional evidence is an internal design aid, not public copy.
- Signal maps stay in server-only modules. The public manifest includes identity, status and language-neutral asset declarations only.
- Images are existing internal placeholders marked \`pending\`. They contain no readable language and are not approved production assets.
- This is a reflective Questype construct model. It is not a clinical diagnosis or a validated psychometric scale.

${sceneStoryboard(content, model)}
`;
}

function coverageBundle(model: DraftJourneyServerModel) {
  const signalContent = draftSignalContent(model.content);
  const coverage = analyzeSignalCoverage(signalContent, model.signalModel);
  const simulation = simulateSignalModel(
    signalContent,
    model.signalModel,
    3000,
    model.content.id === 'journey_council_realms' ? 20260913 : 20260914,
  );
  const expected = simulation.runs / 4;
  const maximumChoiceDeviation = Math.max(
    ...Object.values(simulation.choiceCounts).map(
      (count) => Math.abs(count - expected) / expected,
    ),
  );
  const choiceTexts = model.content.scenes.flatMap((scene) =>
    scene.choices.flatMap((choice) => [
      choice.text.en.toLowerCase(),
      choice.text.es.toLowerCase(),
    ]),
  );
  const exactDuplicates = choiceTexts.filter(
    (text, index) => choiceTexts.indexOf(text) !== index,
  );
  return {
    journeyId: model.content.id,
    contentHash: model.contentHash,
    coverage,
    simulation,
    contentQa: {
      scenes: model.content.scenes.length,
      choices: model.content.scenes.reduce(
        (sum, scene) => sum + scene.choices.length,
        0,
      ),
      fixedSequentialOrder: model.content.scenes.every(
        (scene, index) => scene.order === index + 1,
      ),
      bilingualFieldsComplete: model.content.scenes.every(
        (scene) =>
          scene.title.en &&
          scene.title.es &&
          scene.narrative.en &&
          scene.narrative.es &&
          scene.choices.every(
            (choice) =>
              choice.text.en &&
              choice.text.es &&
              choice.benefit.en &&
              choice.benefit.es &&
              choice.tradeoff.en &&
              choice.tradeoff.es,
          ),
      ),
      exactDuplicateLocalizedChoices: [...new Set(exactDuplicates)],
      maximumChoiceSelectionDeviation: Number(
        maximumChoiceDeviation.toFixed(4),
      ),
      excessiveDensityScenes: coverage.excessiveDensityScenes,
    },
  };
}

function coverageDocument(
  model: DraftJourneyServerModel,
  bundle: ReturnType<typeof coverageBundle>,
) {
  const table = bundle.coverage.signals
    .map((row) => {
      const simulation = bundle.simulation.signals.find(
        (item) => item.signal === row.signal,
      )!;
      return `| \`${row.signal}\` | ${row.opportunityScenes} | ${row.facets.length} | ${row.contexts.length} | ${row.positiveOptions}/${row.negativeOptions}/${row.zeroOptions} | ${row.minimumPossible.toFixed(1)} | ${row.maximumPossible.toFixed(1)} | ${simulation.mean ?? '—'} |`;
    })
    .join('\n');
  const weak = bundle.coverage.signals
    .filter((row) => row.opportunityScenes < 2)
    .map((row) => `\`${row.signal}\``);
  return `# ${model.content.title.en} — Signal Coverage

**Status:** Draft calibration, not psychometric validation  
**Simulation:** ${bundle.simulation.runs} deterministic random-like paths  
**Seed:** ${bundle.simulation.seed}  
**Maximum option-selection deviation:** ${(bundle.contentQa.maximumChoiceSelectionDeviation * 100).toFixed(1)}%  
**Excessive scene density:** ${bundle.coverage.excessiveDensityScenes.length ? list(bundle.coverage.excessiveDensityScenes) : 'none'}

| Signal | Scenes | Facets | Contexts | + / − / 0 options | Min mass | Max mass | Simulated mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${table}

## Review

- Signals with fewer than two discriminating scenes: ${weak.length ? weak.join(', ') : 'none'}.
- Each designed opportunity is directionally balanced across four plausible strategies. A balanced simulation therefore centers near zero without inventing a neutral answer.
- The engine normalizes selected evidence against opportunities within this Journey; raw counts do not flow directly into the accumulated profile.
- Exact duplicate localized choices: ${bundle.contentQa.exactDuplicateLocalizedChoices.length}.
- Missing constructs remain \`insufficient\` and \`null\`; they are never rendered as a midpoint.
- Social-desirability and construct-confound notes remain attached to every scene for editorial review.
`;
}

await mkdir('docs/v2/journeys', { recursive: true });
await mkdir('artifacts', { recursive: true });
const bundles: ReturnType<typeof coverageBundle>[] = [];
for (const item of modelPairs) {
  const bundle = coverageBundle(item.model);
  bundles.push(bundle);
  await writeFile(item.storyboard, storyboardDocument(item.model));
  await writeFile(item.coverage, coverageDocument(item.model, bundle));
  await writeFile(item.artifact, `${JSON.stringify(bundle, null, 2)}\n`);
}

const combinedRows = bundles
  .flatMap((bundle) =>
    bundle.coverage.signals.map(
      (row) =>
        `| ${bundle.journeyId} | \`${row.signal}\` | ${row.opportunityScenes} | ${row.contexts.length} | ${row.positiveOptions} | ${row.negativeOptions} |`,
    ),
  )
  .join('\n');
await writeFile(
  'docs/v2/QUESTYPE_V2_SIGNAL_COVERAGE.md',
  `# Questype V2 — Combined Signal Coverage

This report compares authored opportunities. It checks implementation balance and reach; it does not establish psychological validity.

| Journey | Signal | Scenes | Contexts | Positive options | Negative options |
| --- | --- | ---: | ---: | ---: | ---: |
${combinedRows}

## Interpretation

- **Council of Realms** intentionally concentrates on leadership, collaboration, social confidence, structure and autonomy.
- **Stormbound Passage** intentionally concentrates on risk orientation, adaptability, persistence and emotional regulation.
- Specialized Journeys are allowed to leave constructs unexplored. The accumulated profile records that absence instead of treating it as neutrality.
- Both models use the same stable signal IDs, evidence provenance and normalization contract, so their evidence can be combined without summing raw weights.
`,
);

console.log(
  JSON.stringify(
    {
      generated: modelPairs.map((item, index) => ({
        journey: item.model.content.id,
        storyboard: item.storyboard,
        coverage: item.coverage,
        artifact: item.artifact,
        qa: bundles[index]!.contentQa,
      })),
    },
    null,
    2,
  ),
);
