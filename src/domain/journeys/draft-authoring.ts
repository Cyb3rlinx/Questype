import type { SignalContext, SignalKey } from '../signals/contracts.js';
import {
  localized,
  parseDraftJourneyContent,
  type DraftJourneyContent,
} from './draft-contracts.js';
import { draftSceneId } from './draft-id.js';

export type BilingualSeed = readonly [en: string, es: string];
export type ChoiceSeed = readonly [
  text: BilingualSeed,
  benefit: BilingualSeed,
  tradeoff: BilingualSeed,
];

export interface SceneSeed {
  title: BilingualSeed;
  narrative: BilingualSeed;
  purpose: BilingualSeed;
  psychology: BilingualSeed;
  primary: readonly SignalKey[];
  secondary?: readonly SignalKey[];
  facets: readonly string[];
  contexts: readonly SignalContext[];
  pressure?: boolean;
  visual: BilingualSeed;
  continuity: BilingualSeed;
  desirability?: BilingualSeed;
  confounds?: BilingualSeed;
  choices: readonly [ChoiceSeed, ChoiceSeed, ChoiceSeed, ChoiceSeed];
}

export function buildDraftJourney(input: {
  id: string;
  slug: string;
  title: BilingualSeed;
  acts: readonly BilingualSeed[];
  scenes: readonly SceneSeed[];
}): DraftJourneyContent {
  const content = {
    id: input.id,
    slug: input.slug,
    title: localized(...input.title),
    journeyVersion: '0.1',
    scoringVersion: '0.1',
    acts: input.acts.map((act) => localized(...act)),
    scenes: input.scenes.map((seed, index) => {
      const order = index + 1;
      const sceneId = draftSceneId(input.slug, order);
      const act = Math.floor(index / 3) + 1;
      return {
        id: sceneId,
        act,
        order,
        title: localized(...seed.title),
        narrative: localized(...seed.narrative),
        narrativePurpose: localized(...seed.purpose),
        psychologicalPurpose: localized(...seed.psychology),
        primarySignals: [...seed.primary],
        secondarySignals: [...(seed.secondary ?? [])],
        facets: [...seed.facets],
        contexts: [...seed.contexts],
        socialDesirabilityRisk: localized(
          ...(seed.desirability ?? [
            'All four responses retain a legitimate benefit and a visible cost; none is framed as the virtuous answer.',
            'Las cuatro respuestas conservan un beneficio legítimo y un costo visible; ninguna se presenta como la respuesta virtuosa.',
          ]),
        ),
        constructConfounds: localized(
          ...(seed.confounds ?? [
            'Interpret the choice only inside this situation and avoid treating confidence, care or caution as a global trait.',
            'La elección se interpreta solo dentro de esta situación, sin convertir confianza, cuidado o cautela en un rasgo global.',
          ]),
        ),
        isPressure: seed.pressure ?? false,
        visualConcept: localized(...seed.visual),
        continuityNotes: localized(...seed.continuity),
        choices: seed.choices.map((choice, choiceIndex) => ({
          id: `${sceneId}_choice_${String.fromCharCode(97 + choiceIndex)}`,
          text: localized(...choice[0]),
          benefit: localized(...choice[1]),
          tradeoff: localized(...choice[2]),
        })),
      };
    }),
  };
  return parseDraftJourneyContent(content);
}
