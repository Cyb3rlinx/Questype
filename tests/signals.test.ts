import test from 'node:test';
import assert from 'node:assert/strict';
import { journeyV1 } from '../src/domain/content/journey-v1.js';
import { contentHash } from '../src/database/content-hash.js';
import { createScoringEngine } from '../src/domain/scoring/engine.js';
import {
  aggregateSignalAssessments,
  createSignalEngine,
  type SignalContent,
} from '../src/domain/signals/engine.js';
import {
  SIGNAL_KEYS,
  type JourneySignalAssessment,
  type JourneySignalModel,
  type SignalKey,
  type SignalMeasurement,
} from '../src/domain/signals/contracts.js';
import { signalDefinitions } from '../src/domain/signals/registry.js';
import { unwrittenRoadSignalModel } from '../src/domain/journeys/the-unwritten-road/signals.server.js';

const v1Answers = journeyV1.scenes.map((scene) => ({
  scene_id: scene.id,
  choice_id: scene.choices[0]!.id,
}));

test('the twelve signal definitions are complete, bilingual and operational', () => {
  assert.deepEqual(
    signalDefinitions.map((definition) => definition.id),
    [...SIGNAL_KEYS],
  );
  for (const definition of signalDefinitions) {
    assert.ok(definition.label.en.length > 2);
    assert.ok(definition.label.es.length > 2);
    assert.ok(definition.definition.en.length > 30);
    assert.ok(definition.definition.es.length > 30);
    assert.ok(definition.facets.length >= 3);
    assert.ok(definition.inclusionCriteria.length >= 3);
    assert.ok(definition.exclusionCriteria.length >= 3);
    assert.ok(definition.allowedContexts.length >= 4);
  }
});

test('V1 signal evidence is deterministic, traceable and parallel to frozen scoring', () => {
  const beforeHash = contentHash(journeyV1);
  const legacyBefore = createScoringEngine(journeyV1).evaluate(v1Answers);
  const engine = createSignalEngine(journeyV1, unwrittenRoadSignalModel);
  const first = engine.evaluate(v1Answers, { resultId: 'result-v1-a' });
  const second = engine.evaluate(v1Answers, { resultId: 'result-v1-a' });
  const legacyAfter = createScoringEngine(journeyV1).evaluate(v1Answers);

  assert.deepEqual(first, second);
  assert.equal(first.fingerprint.length, 64);
  assert.equal(first.decisionsAnalyzed, 15);
  assert.ok(first.evidence.length > 20);
  assert.ok(
    first.evidence.every(
      (item) =>
        item.journeyId === 'journey_unwritten_road' &&
        item.sceneId.startsWith('scene_') &&
        item.choiceId.startsWith(item.sceneId),
    ),
  );
  assert.equal(contentHash(journeyV1), beforeHash);
  assert.deepEqual(legacyAfter, legacyBefore);
});

const syntheticContent: SignalContent = {
  journey_version: '1.0',
  scoring_version: '1.0',
  scenes: [1, 2, 3].map((number) => ({
    id: `trial_${number}`,
    choices: [
      { id: `trial_${number}_reflect` },
      { id: `trial_${number}_commit` },
    ],
  })),
};

const syntheticModel: JourneySignalModel = {
  id: 'synthetic_signals_1_0',
  schemaVersion: '1.0',
  journeyId: 'journey_synthetic',
  journeyVersion: '1.0',
  scoringVersion: '1.0',
  choiceEvidence: Object.fromEntries(
    [1, 2, 3].flatMap((number) => [
      [
        `trial_${number}_reflect`,
        [
          {
            signal: 'risk_tolerance',
            facet: 'calculated_risk',
            context: 'uncertainty',
            direction: -1,
            weight: 0.6,
            observationType: 'behavioral_choice',
          },
        ],
      ],
      [
        `trial_${number}_commit`,
        [
          {
            signal: 'risk_tolerance',
            facet: 'calculated_risk',
            context: 'uncertainty',
            direction: 1,
            weight: 0.6,
            observationType: 'behavioral_choice',
          },
        ],
      ],
    ]),
  ) as JourneySignalModel['choiceEvidence'],
};

test('signal engine handles missing data, opposing evidence and coverage without a fake midpoint', () => {
  const engine = createSignalEngine(syntheticContent, syntheticModel);
  const assessment = engine.evaluate(
    [
      { scene_id: 'trial_1', choice_id: 'trial_1_commit' },
      { scene_id: 'trial_2', choice_id: 'trial_2_reflect' },
      { scene_id: 'trial_3', choice_id: 'trial_3_commit' },
    ],
    { resultId: 'synthetic-result' },
  );
  assert.equal(assessment.signals.risk_tolerance.value, 0.3333);
  assert.equal(
    assessment.signals.risk_tolerance.directionalConsistency,
    0.3333,
  );
  assert.equal(assessment.signals.risk_tolerance.opportunityCoverage, 1);
  assert.equal(assessment.signals.autonomy.value, null);
  assert.equal(assessment.signals.autonomy.band, 'insufficient');
  assert.equal(assessment.signals.autonomy.observations, 0);
});

test('signal model rejects unknown facets, contexts and non-discriminating mappings', () => {
  const invalidFacet = structuredClone(syntheticModel);
  invalidFacet.choiceEvidence.trial_1_commit![0]!.facet = 'bravery';
  assert.throws(() => createSignalEngine(syntheticContent, invalidFacet));

  const invalidContext = structuredClone(syntheticModel);
  invalidContext.choiceEvidence.trial_1_commit![0]!.context = 'caregiving';
  assert.throws(() => createSignalEngine(syntheticContent, invalidContext));

  const flat = structuredClone(syntheticModel);
  for (const contributions of Object.values(flat.choiceEvidence))
    contributions[0]!.direction = 1;
  assert.throws(() => createSignalEngine(syntheticContent, flat));
});

function measurement(
  signal: SignalKey,
  value: number | null,
  scenes: number,
): SignalMeasurement {
  return {
    signal,
    value,
    band: value === null ? 'insufficient' : 'strong',
    observations: scenes,
    contributingObservations: scenes,
    scenes,
    contexts: value === null ? 0 : 3,
    journeys: value === null ? 0 : 1,
    sceneIds: Array.from({ length: scenes }, (_, index) => `scene_${index}`),
    contextIds:
      value === null
        ? []
        : ['uncertainty', 'physical_risk', 'resource_scarcity'],
    opportunityCoverage: value === null ? 0 : 1,
    directionalConsistency: value === null ? 0 : 1,
  };
}

function fakeAssessment(
  resultId: string,
  journeyId: string,
  value: number,
  scenes: number,
): JourneySignalAssessment {
  return {
    resultId,
    journeyId,
    journeyVersion: '1.0',
    scoringVersion: '1.0',
    signalModelId: `${journeyId}_signals`,
    signalModelVersion: '1.0',
    decisionsAnalyzed: scenes,
    signals: Object.fromEntries(
      SIGNAL_KEYS.map((signal) => [
        signal,
        measurement(signal, signal === 'structure' ? value : null, scenes),
      ]),
    ) as Record<SignalKey, SignalMeasurement>,
    evidence: [],
    fingerprint: resultId.padEnd(64, '0').slice(0, 64),
  };
}

test('aggregation caps each Journey contribution and creates reproducible profile depth', () => {
  const large = fakeAssessment('a', 'journey_large', 1, 14);
  const focused = fakeAssessment('b', 'journey_focused', -1, 3);
  const two = aggregateSignalAssessments([large, focused]);
  assert.equal(two.signals.structure.value, 0);
  assert.equal(two.profileDepth, 'emerging');
  assert.equal(two.journeysCompleted, 2);
  assert.equal(two.fingerprint.length, 64);
  assert.deepEqual(two, aggregateSignalAssessments([focused, large]));

  const three = aggregateSignalAssessments([
    large,
    focused,
    fakeAssessment('c', 'journey_third', 0.5, 5),
  ]);
  assert.equal(three.profileDepth, 'established');
  assert.equal(three.sourceResultIds.join(','), 'a,b,c');
});
