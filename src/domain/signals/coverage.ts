import type { Answer } from '../types.js';
import {
  SIGNAL_KEYS,
  type JourneySignalModel,
  type SignalKey,
} from './contracts.js';
import { createSignalEngine, type SignalContent } from './engine.js';

export interface SignalCoverageRow {
  signal: SignalKey;
  opportunityScenes: number;
  facets: string[];
  contexts: string[];
  positiveOptions: number;
  negativeOptions: number;
  zeroOptions: number;
  minimumPossible: number;
  maximumPossible: number;
}

export interface SignalCoverageReport {
  journeyId: string;
  journeyVersion: string;
  modelId: string;
  signals: SignalCoverageRow[];
  sceneDensity: { sceneId: string; signals: number }[];
  excessiveDensityScenes: string[];
}

function valueForChoice(
  model: JourneySignalModel,
  choiceId: string,
  signal: SignalKey,
) {
  return (model.choiceEvidence[choiceId] ?? [])
    .filter((entry) => entry.signal === signal)
    .reduce((sum, entry) => sum + entry.direction * entry.weight, 0);
}

export function analyzeSignalCoverage(
  content: SignalContent,
  model: JourneySignalModel,
): SignalCoverageReport {
  createSignalEngine(content, model);
  const signals = SIGNAL_KEYS.map((signal) => {
    let opportunityScenes = 0;
    let positiveOptions = 0;
    let negativeOptions = 0;
    let zeroOptions = 0;
    let minimumPossible = 0;
    let maximumPossible = 0;
    const facets = new Set<string>();
    const contexts = new Set<string>();
    for (const scene of content.scenes) {
      const values = scene.choices.map((choice) => {
        for (const entry of model.choiceEvidence[choice.id] ?? [])
          if (entry.signal === signal) {
            facets.add(entry.facet);
            contexts.add(entry.context);
          }
        return valueForChoice(model, choice.id, signal);
      });
      if (new Set(values.map((value) => value.toFixed(4))).size < 2) continue;
      opportunityScenes++;
      positiveOptions += values.filter((value) => value > 0).length;
      negativeOptions += values.filter((value) => value < 0).length;
      zeroOptions += values.filter((value) => value === 0).length;
      minimumPossible += Math.min(...values);
      maximumPossible += Math.max(...values);
    }
    return {
      signal,
      opportunityScenes,
      facets: [...facets].sort(),
      contexts: [...contexts].sort(),
      positiveOptions,
      negativeOptions,
      zeroOptions,
      minimumPossible: Number(minimumPossible.toFixed(4)),
      maximumPossible: Number(maximumPossible.toFixed(4)),
    };
  });
  const sceneDensity = content.scenes.map((scene) => ({
    sceneId: scene.id,
    signals: new Set(
      scene.choices.flatMap((choice) =>
        (model.choiceEvidence[choice.id] ?? []).map((entry) => entry.signal),
      ),
    ).size,
  }));
  return {
    journeyId: model.journeyId,
    journeyVersion: model.journeyVersion,
    modelId: model.id,
    signals,
    sceneDensity,
    excessiveDensityScenes: sceneDensity
      .filter((scene) => scene.signals > 5)
      .map((scene) => scene.sceneId),
  };
}

function generator(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

export function simulateSignalModel(
  content: SignalContent,
  model: JourneySignalModel,
  runs = 2000,
  seed = 20260911,
) {
  const random = generator(seed);
  const engine = createSignalEngine(content, model);
  const values = Object.fromEntries(
    SIGNAL_KEYS.map((signal) => [signal, [] as number[]]),
  ) as Record<SignalKey, number[]>;
  const bands = SIGNAL_KEYS.reduce(
    (result, signal) => {
      result[signal] = {
        insufficient: 0,
        emerging: 0,
        moderate: 0,
        strong: 0,
      };
      return result;
    },
    {} as Record<SignalKey, Record<string, number>>,
  );
  const choiceCounts: Record<string, number> = {};

  for (let run = 0; run < runs; run++) {
    const answers: Answer[] = content.scenes.map((scene) => {
      const choice =
        scene.choices[Math.floor(random() * scene.choices.length)]!;
      choiceCounts[choice.id] = (choiceCounts[choice.id] ?? 0) + 1;
      return { scene_id: scene.id, choice_id: choice.id };
    });
    const result = engine.evaluate(answers, { resultId: `simulation-${run}` });
    for (const signal of SIGNAL_KEYS) {
      const measurement = result.signals[signal];
      bands[signal][measurement.band] =
        (bands[signal][measurement.band] ?? 0) + 1;
      if (measurement.value !== null) values[signal].push(measurement.value);
    }
  }

  return {
    journeyId: model.journeyId,
    modelId: model.id,
    runs,
    seed,
    signals: SIGNAL_KEYS.map((signal) => {
      const samples = values[signal];
      const mean = samples.length
        ? samples.reduce((sum, value) => sum + value, 0) / samples.length
        : null;
      return {
        signal,
        measuredRuns: samples.length,
        mean: mean === null ? null : Number(mean.toFixed(4)),
        minimum: samples.length ? Math.min(...samples) : null,
        maximum: samples.length ? Math.max(...samples) : null,
        bands: bands[signal],
      };
    }),
    choiceCounts,
  };
}
