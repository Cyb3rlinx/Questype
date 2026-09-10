import type { Answer } from '../types.js';
import { deepFreeze } from '../types.js';
import { stableHash } from '../../database/content-hash.js';
import {
  SIGNAL_KEYS,
  journeySignalModelSchema,
  type AccumulatedSignalProfile,
  type EvidenceBand,
  type JourneySignalAssessment,
  type JourneySignalModel,
  type SignalContext,
  type SignalEvidenceRecord,
  type SignalKey,
  type SignalMeasurement,
} from './contracts.js';
import { signalDefinition } from './registry.js';

export interface SignalContent {
  journey_version: string;
  scoring_version: string;
  scenes: readonly {
    id: string;
    choices: readonly { id: string }[];
  }[];
}

interface Opportunity {
  sceneId: string;
  signal: SignalKey;
  values: Map<string, number>;
  contexts: Set<SignalContext>;
  maxAbsolute: number;
}

const round = (value: number, places = 4) => Number(value.toFixed(places));
const clamp = (value: number, lower: number, upper: number) =>
  Math.max(lower, Math.min(upper, value));

function evidenceBand(input: {
  signal: SignalKey;
  observations: number;
  contributingObservations: number;
  scenes: number;
  contexts: number;
  journeys: number;
  directionalConsistency: number;
  opportunityCoverage: number;
}): EvidenceBand {
  const definition = signalDefinition(input.signal);
  if (
    input.observations < definition.minimumObservations ||
    input.contributingObservations <
      definition.minimumContributingObservations ||
    input.scenes < definition.minimumScenes ||
    input.contexts < definition.minimumContexts
  )
    return 'insufficient';

  const strength =
    Math.min(input.observations / 6, 1) * 0.3 +
    Math.min(input.scenes / 5, 1) * 0.25 +
    Math.min(input.contexts / 3, 1) * 0.15 +
    Math.min(input.journeys / 3, 1) * 0.1 +
    input.directionalConsistency * 0.1 +
    input.opportunityCoverage * 0.1;
  if (strength >= 0.78) return 'strong';
  if (strength >= 0.52) return 'moderate';
  return 'emerging';
}

function validateAnswers(content: SignalContent, answers: readonly Answer[]) {
  if (answers.length !== content.scenes.length)
    throw new Error('Signal assessment requires a completed Journey');
  answers.forEach((answer, index) => {
    const scene = content.scenes[index]!;
    if (answer.scene_id !== scene.id)
      throw new Error(`Signal answers must follow scene order: ${scene.id}`);
    if (!scene.choices.some((choice) => choice.id === answer.choice_id))
      throw new Error(`Unknown signal-model choice: ${answer.choice_id}`);
  });
}

function validateModel(content: SignalContent, input: JourneySignalModel) {
  const model = journeySignalModelSchema.parse(input);
  if (
    model.journeyVersion !== content.journey_version ||
    model.scoringVersion !== content.scoring_version
  )
    throw new Error('Signal model and Journey version do not match');

  const choices = new Map<string, string>();
  for (const scene of content.scenes)
    for (const choice of scene.choices) choices.set(choice.id, scene.id);

  for (const [choiceId, contributions] of Object.entries(
    model.choiceEvidence,
  )) {
    if (!choices.has(choiceId))
      throw new Error(`Signal model references unknown choice: ${choiceId}`);
    const unique = new Set<string>();
    for (const contribution of contributions) {
      const definition = signalDefinition(contribution.signal);
      if (!definition.facets.some((facet) => facet.id === contribution.facet))
        throw new Error(
          `Unknown facet ${contribution.signal}:${contribution.facet}`,
        );
      if (!definition.allowedContexts.includes(contribution.context))
        throw new Error(
          `Context ${contribution.context} is not allowed for ${contribution.signal}`,
        );
      const identity = `${contribution.signal}:${contribution.facet}:${contribution.context}`;
      if (unique.has(identity))
        throw new Error(`Duplicate signal contribution in ${choiceId}`);
      unique.add(identity);
    }
  }
  return deepFreeze(model);
}

function buildOpportunities(
  content: SignalContent,
  model: JourneySignalModel,
): Opportunity[] {
  const opportunities: Opportunity[] = [];
  for (const scene of content.scenes) {
    for (const signal of SIGNAL_KEYS) {
      const values = new Map<string, number>();
      const contexts = new Set<SignalContext>();
      for (const choice of scene.choices) {
        const contributions = (model.choiceEvidence[choice.id] ?? []).filter(
          (entry) => entry.signal === signal,
        );
        const value = contributions.reduce(
          (sum, entry) => sum + entry.direction * entry.weight,
          0,
        );
        values.set(choice.id, value);
        contributions.forEach((entry) => contexts.add(entry.context));
      }
      const possible = [...values.values()];
      if (new Set(possible.map((value) => round(value))).size < 2) continue;
      const maxAbsolute = Math.max(...possible.map(Math.abs));
      if (maxAbsolute === 0) continue;
      opportunities.push({
        sceneId: scene.id,
        signal,
        values,
        contexts,
        maxAbsolute,
      });
    }
  }
  if (opportunities.length === 0)
    throw new Error('Signal model contains no discriminating opportunities');
  return opportunities;
}

function emptyMeasurement(signal: SignalKey): SignalMeasurement {
  return {
    signal,
    value: null,
    band: 'insufficient',
    observations: 0,
    contributingObservations: 0,
    scenes: 0,
    contexts: 0,
    journeys: 0,
    sceneIds: [],
    contextIds: [],
    opportunityCoverage: 0,
    directionalConsistency: 0,
  };
}

export function createSignalEngine(
  content: SignalContent,
  inputModel: JourneySignalModel,
) {
  const model = validateModel(content, inputModel);
  const opportunities = buildOpportunities(content, model);
  const totalBySignal = Object.fromEntries(
    SIGNAL_KEYS.map((signal) => [
      signal,
      opportunities.filter((item) => item.signal === signal),
    ]),
  ) as Record<SignalKey, Opportunity[]>;

  return {
    model,
    opportunities,
    evaluate(
      answers: readonly Answer[],
      metadata: { resultId: string },
    ): JourneySignalAssessment {
      validateAnswers(content, answers);
      const answerByScene = new Map(
        answers.map((answer) => [answer.scene_id, answer.choice_id]),
      );
      const evidence: SignalEvidenceRecord[] = [];

      for (const answer of answers) {
        for (const contribution of model.choiceEvidence[answer.choice_id] ?? [])
          evidence.push({
            journeyId: model.journeyId,
            journeyVersion: model.journeyVersion,
            scoringVersion: model.scoringVersion,
            modelId: model.id,
            sceneId: answer.scene_id,
            choiceId: answer.choice_id,
            signal: contribution.signal,
            facet: contribution.facet,
            context: contribution.context,
            direction: contribution.direction,
            weight: contribution.weight,
            signedContribution: round(
              contribution.direction * contribution.weight,
            ),
            observationType: contribution.observationType,
          });
      }

      const signals = Object.fromEntries(
        SIGNAL_KEYS.map((signal) => {
          const possible = totalBySignal[signal];
          if (possible.length === 0) return [signal, emptyMeasurement(signal)];
          const observed = possible.filter((item) =>
            answerByScene.has(item.sceneId),
          );
          const selectedValues = observed.map((item) =>
            item.values.get(answerByScene.get(item.sceneId)!)!,
          );
          const selectedMass = selectedValues.reduce(
            (sum, value) => sum + value,
            0,
          );
          const absoluteMass = selectedValues.reduce(
            (sum, value) => sum + Math.abs(value),
            0,
          );
          const opportunityMass = observed.reduce(
            (sum, item) => sum + item.maxAbsolute,
            0,
          );
          const sceneIds = observed.map((item) => item.sceneId);
          const contextIds = [
            ...new Set(observed.flatMap((item) => [...item.contexts])),
          ].sort() as SignalContext[];
          const opportunityCoverage = round(observed.length / possible.length);
          const directionalConsistency =
            absoluteMass === 0
              ? 0
              : round(Math.abs(selectedMass) / absoluteMass);
          const summary = {
            signal,
            observations: observed.length,
            contributingObservations: selectedValues.filter(
              (value) => value !== 0,
            ).length,
            scenes: new Set(sceneIds).size,
            contexts: contextIds.length,
            journeys: 1,
            sceneIds,
            contextIds,
            opportunityCoverage,
            directionalConsistency,
          };
          const band = evidenceBand(summary);
          return [
            signal,
            {
              ...summary,
              band,
              value:
                band === 'insufficient'
                  ? null
                  : round(clamp(selectedMass / opportunityMass, -1, 1)),
            },
          ];
        }),
      ) as Record<SignalKey, SignalMeasurement>;

      const assessment = {
        resultId: metadata.resultId,
        journeyId: model.journeyId,
        journeyVersion: model.journeyVersion,
        scoringVersion: model.scoringVersion,
        signalModelId: model.id,
        signalModelVersion: model.schemaVersion,
        decisionsAnalyzed: answers.length,
        signals,
        evidence,
      };
      return {
        ...assessment,
        fingerprint: stableHash(assessment),
      };
    },
  };
}

export type SignalEngine = ReturnType<typeof createSignalEngine>;

const bandWeight: Record<EvidenceBand, number> = {
  insufficient: 0,
  emerging: 0.5,
  moderate: 0.75,
  strong: 1,
};

export function aggregateSignalAssessments(
  input: readonly JourneySignalAssessment[],
): AccumulatedSignalProfile {
  const assessments = [...input].sort((a, b) =>
    a.resultId.localeCompare(b.resultId, 'en'),
  );
  if (
    new Set(assessments.map((item) => item.resultId)).size !==
    assessments.length
  )
    throw new Error('Accumulated profile sources must be unique');
  const journeysCompleted = new Set(assessments.map((item) => item.journeyId))
    .size;
  const signals = Object.fromEntries(
    SIGNAL_KEYS.map((signal) => {
      const sources = assessments
        .map((assessment) => assessment.signals[signal])
        .filter(
          (measurement) =>
            measurement.value !== null && bandWeight[measurement.band] > 0,
        );
      if (sources.length === 0) return [signal, emptyMeasurement(signal)];
      const weights = sources.map((source) => bandWeight[source.band]);
      const weightTotal = weights.reduce((sum, value) => sum + value, 0);
      const value = round(
        sources.reduce(
          (sum, source, index) => sum + source.value! * weights[index]!,
          0,
        ) / weightTotal,
      );
      const sceneIds = [
        ...new Set(
          assessments.flatMap((assessment) =>
            assessment.signals[signal].sceneIds.map(
              (scene) => `${assessment.journeyId}:${scene}`,
            ),
          ),
        ),
      ].sort();
      const contextIds = [
        ...new Set(sources.flatMap((source) => source.contextIds)),
      ].sort() as SignalContext[];
      const journeyCount = new Set(
        assessments
          .filter((assessment) => assessment.signals[signal].value !== null)
          .map((assessment) => assessment.journeyId),
      ).size;
      const opportunityCoverage = round(
        sources.reduce((sum, source) => sum + source.opportunityCoverage, 0) /
          sources.length,
      );
      const directionalConsistency = round(
        sources.reduce(
          (sum, source) => sum + source.directionalConsistency,
          0,
        ) / sources.length,
      );
      const summary = {
        signal,
        value,
        observations: sources.reduce(
          (sum, source) => sum + source.observations,
          0,
        ),
        contributingObservations: sources.reduce(
          (sum, source) => sum + source.contributingObservations,
          0,
        ),
        scenes: sceneIds.length,
        contexts: contextIds.length,
        journeys: journeyCount,
        sceneIds,
        contextIds,
        opportunityCoverage,
        directionalConsistency,
      };
      return [signal, { ...summary, band: evidenceBand(summary) }];
    }),
  ) as Record<SignalKey, SignalMeasurement>;

  const profileDepth: AccumulatedSignalProfile['profileDepth'] =
    journeysCompleted >= 5
      ? 'extensive'
      : journeysCompleted >= 3
        ? 'established'
        : journeysCompleted === 2
          ? 'emerging'
          : 'initial';
  const profile = {
    aggregationVersion: '1.0' as const,
    sourceResultIds: assessments.map((item) => item.resultId),
    journeysCompleted,
    decisionsAnalyzed: assessments.reduce(
      (sum, item) => sum + item.decisionsAnalyzed,
      0,
    ),
    profileDepth,
    signals,
  };
  return { ...profile, fingerprint: stableHash(profile) };
}
