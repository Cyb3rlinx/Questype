import type {
  JourneyPublicManifest,
  JourneySceneVisual,
  LocalizedText,
  VisualAsset,
} from '../contracts.js';
import { parseJourneyManifest } from '../contracts.js';

const titles: readonly LocalizedText[] = [
  { en: 'The Ink Is Still Fresh', es: 'La tinta aún está fresca' },
  {
    en: 'The Merchant Who Recognized the Letter',
    es: 'El mercader que reconoció la carta',
  },
  { en: 'The Broken Bridge', es: 'El puente roto' },
  {
    en: 'The Storm in the Watchtower',
    es: 'La tormenta en la torre de vigilancia',
  },
  { en: 'A Stranger Beside the Fire', es: 'Una desconocida junto al fuego' },
  { en: 'The Cart in the Mud', es: 'La carreta en el barro' },
  { en: 'The Creature Beneath the Shelter', es: 'La criatura bajo el refugio' },
  { en: 'The Coast Beneath the Moon', es: 'La costa bajo la luna' },
  { en: 'The Rising Tide', es: 'La marea creciente' },
  { en: 'The Four Objects', es: 'Los cuatro objetos' },
  { en: 'The Guardian of the Path', es: 'El guardián del camino' },
  {
    en: 'The Feast of Those Who Arrived',
    es: 'El banquete de quienes llegaron',
  },
  { en: 'The Unlit Lighthouse', es: 'El faro apagado' },
  {
    en: 'What You Leave for the Next Traveler',
    es: 'Lo que dejas para el próximo viajero',
  },
  { en: 'The Melody That Remembered You', es: 'La melodía que te recordaba' },
];

function asset(
  id: string,
  src: string,
  alt: LocalizedText,
  width = 1600,
  height = 900,
  qaStatus: VisualAsset['qaStatus'] = 'approved',
): VisualAsset {
  return {
    id,
    src,
    responsiveSrc: src.replace('.webp', '-sm.webp'),
    width,
    height,
    focalPoint: { x: 0.5, y: 0.5 },
    alt,
    containsReadableLanguage: false,
    qaStatus,
    provenance: 'Questype V1 commissioned image collection',
  };
}

function sceneAlt(
  order: number,
  representation: 'man' | 'woman',
): LocalizedText {
  const title = titles[order - 1]!;
  const subject =
    representation === 'man' ? 'male traveler' : 'female traveler';
  const subjectEs = representation === 'man' ? 'viajero' : 'viajera';
  return {
    en: `${title.en}, featuring the ${subject}`,
    es: `${title.es}, con ${subjectEs} como protagonista`,
  };
}

function standardScene(
  representation: 'man' | 'woman',
  order: number,
  fileNumber: number,
): JourneySceneVisual {
  const file = String(fileNumber).padStart(2, '0');
  const qaStatus: VisualAsset['qaStatus'] = [4, 12, 13, 14].includes(order)
    ? 'repair'
    : [1, 2].includes(order)
      ? 'pending'
      : 'approved';
  return {
    default: asset(
      `${representation}-scene-${String(order).padStart(2, '0')}`,
      `/images/journey/${representation}-${file}.webp`,
      sceneAlt(order, representation),
      1600,
      900,
      qaStatus,
    ),
  };
}

function representationScenes(representation: 'man' | 'woman') {
  const scenes: Record<string, JourneySceneVisual> = {};
  for (let order = 1; order <= 15; order++) {
    const id = `scene_${String(order).padStart(2, '0')}`;
    if (order === 5) {
      scenes[id] = {
        default: asset(
          `${representation}-scene-05-mara`,
          `/images/journey/${representation}-05-mara.webp`,
          sceneAlt(order, representation),
          1600,
          900,
          'pending',
        ),
      };
      continue;
    }
    if (order === 10 || order === 11) {
      const variants = Object.fromEntries(
        ['a', 'b', 'c', 'd'].map((letter, index) => [
          `scene_10_choice_${letter}`,
          asset(
            `${representation}-scene-10-object-${index + 1}`,
            `/images/journey/${representation}-10-${index + 1}.webp`,
            sceneAlt(order, representation),
          ),
        ]),
      );
      scenes[id] = {
        default: variants.scene_10_choice_a!,
        choiceVariants: variants,
        ...(order === 11 ? { inheritsChoiceFrom: 'scene_10' } : {}),
      };
      continue;
    }
    const fileNumber = order <= 4 ? order : order - 1;
    scenes[id] = standardScene(representation, order, fileNumber);
  }
  return scenes;
}

export const unwrittenRoadManifest: JourneyPublicManifest =
  parseJourneyManifest({
    id: 'journey_unwritten_road',
    legacyContentId: 'archetype-journey',
    slug: 'the-unwritten-road',
    status: 'published',
    access: 'free',
    currentVersion: '1.1',
    scoringVersion: '1.1',
    title: { en: 'The Unwritten Road', es: 'El camino no escrito' },
    shortDescription: {
      en: 'Follow a mysterious invitation toward the Lighthouse of Vigil and discover the archetypal patterns in the way you travel.',
      es: 'Sigue una invitación misteriosa hacia el Faro de la Vigilia y descubre los patrones arquetípicos presentes en tu manera de avanzar.',
    },
    assessmentFocus: {
      en: 'Archetypes & Identity',
      es: 'Arquetipos e identidad',
    },
    tags: {
      en: ['Archetypes', 'Identity', 'Motivations', 'Decision Style'],
      es: ['Arquetipos', 'Identidad', 'Motivaciones', 'Estilo de decisión'],
    },
    actNames: {
      en: [
        'The Call',
        'The Threshold',
        'Allies & Strangers',
        'The Trials',
        'The Offering',
        'The Lighthouse',
        'The Return',
      ],
      es: [
        'La llamada',
        'El umbral',
        'Aliados y desconocidos',
        'Las pruebas',
        'La ofrenda',
        'El faro',
        'El regreso',
      ],
    },
    focus: ['archetypes', 'motivation', 'decision_style', 'shadow'],
    locales: ['en', 'es'],
    sceneCount: 15,
    actCount: 7,
    estimatedMinutes: 20,
    legacyVisualQaException: true,
    assets: {
      onboarding: asset(
        'unwritten-road-onboarding',
        '/images/forest-waystation.webp',
        {
          en: 'A quiet path through an ancient forest',
          es: 'Un sendero tranquilo a través de un bosque antiguo',
        },
        1672,
        941,
        'pending',
      ),
      processing: asset(
        'unwritten-road-processing',
        '/images/ridge-beacon.webp',
        {
          en: 'A beacon overlooking a quiet valley',
          es: 'Un faro sobre un valle silencioso',
        },
        1672,
        941,
      ),
      scenes: {
        man: representationScenes('man'),
        woman: representationScenes('woman'),
      },
    },
  });
