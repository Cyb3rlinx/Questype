import { draftSceneId } from './draft-id.js';
import {
  parseJourneyManifest,
  type JourneyPublicManifest,
  type JourneySceneVisual,
  type LocalizedText,
  type VisualAsset,
} from './contracts.js';

function placeholderAsset(
  id: string,
  alt: LocalizedText,
  image: 'valley' | 'lighthouse' = 'valley',
): VisualAsset {
  return {
    id,
    src:
      image === 'lighthouse'
        ? '/images/hero-lighthouse.webp'
        : '/images/valley-wide.webp',
    responsiveSrc:
      image === 'lighthouse'
        ? '/images/hero-lighthouse-sm.webp'
        : '/images/valley-wide-sm.webp',
    width: 1600,
    height: 900,
    focalPoint: { x: image === 'lighthouse' ? 0.72 : 0.5, y: 0.5 },
    alt,
    containsReadableLanguage: false,
    qaStatus: 'pending',
    provenance:
      'Questype internal development placeholder; final art not generated',
  };
}

export function buildDraftManifest(
  journey: {
    id: string;
    slug: string;
    title: LocalizedText;
    journeyVersion: string;
    scoringVersion: string;
    acts: readonly LocalizedText[];
    sceneCount: number;
  },
  input: {
    description: LocalizedText;
    assessmentFocus: LocalizedText;
    tags: { en: readonly string[]; es: readonly string[] };
    focus: readonly string[];
    estimatedMinutes: number;
    onboardingAsset?: VisualAsset;
  },
): JourneyPublicManifest {
  const sceneAssets = (representation: 'man' | 'woman') =>
    Object.fromEntries(
      Array.from({ length: journey.sceneCount }, (_, index) => index + 1).map(
        (order) => [
          draftSceneId(journey.slug, order),
          {
            default: placeholderAsset(
              `${journey.slug}-${representation}-${String(order).padStart(2, '0')}-placeholder`,
              {
                en: `${journey.title.en}, scene ${order} internal placeholder with a ${representation === 'man' ? 'male' : 'female'} traveler`,
                es: `${journey.title.es}, imagen provisoria interna de la escena ${order} con ${representation === 'man' ? 'un viajero' : 'una viajera'}`,
              },
            ),
          } satisfies JourneySceneVisual,
        ],
      ),
    );

  return parseJourneyManifest({
    id: journey.id,
    legacyContentId: journey.id,
    slug: journey.slug,
    status: 'draft',
    access: 'entitlement',
    currentVersion: journey.journeyVersion,
    scoringVersion: journey.scoringVersion,
    title: journey.title,
    shortDescription: input.description,
    assessmentFocus: input.assessmentFocus,
    tags: input.tags,
    actNames: {
      en: journey.acts.map((act) => act.en),
      es: journey.acts.map((act) => act.es),
    },
    focus: input.focus,
    locales: ['en', 'es'],
    sceneCount: journey.sceneCount,
    actCount: journey.acts.length,
    estimatedMinutes: input.estimatedMinutes,
    legacyVisualQaException: false,
    assets: {
      onboarding:
        input.onboardingAsset ??
        placeholderAsset(
          `${journey.slug}-onboarding-placeholder`,
          {
            en: `${journey.title.en}, internal development placeholder`,
            es: `${journey.title.es}, imagen provisoria de desarrollo interno`,
          },
          'lighthouse',
        ),
      processing: placeholderAsset(`${journey.slug}-processing-placeholder`, {
        en: `${journey.title.en} result processing placeholder`,
        es: `Imagen provisoria para el procesamiento de ${journey.title.es}`,
      }),
      scenes: {
        man: sceneAssets('man'),
        woman: sceneAssets('woman'),
      },
    },
  });
}
