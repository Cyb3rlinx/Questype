import { buildDraftManifest } from '../draft-manifest.js';
import { councilOfRealmsMetadata } from './metadata.js';

export const councilOfRealmsManifest = buildDraftManifest(
  councilOfRealmsMetadata,
  {
    description: {
      en: 'Enter a divided council where every alliance, disagreement and responsibility reveals how you coordinate, influence, collaborate and lead.',
      es: 'Entra en un consejo dividido donde cada alianza, desacuerdo y responsabilidad revela cómo coordinas, influyes, colaboras y lideras.',
    },
    assessmentFocus: {
      en: 'Leadership & Collaboration',
      es: 'Liderazgo y colaboración',
    },
    tags: {
      en: [
        'Leadership',
        'Collaboration',
        'Social Confidence',
        'Structure',
        'Autonomy',
      ],
      es: [
        'Liderazgo',
        'Colaboración',
        'Seguridad social',
        'Estructura',
        'Autonomía',
      ],
    },
    focus: [
      'leadership_initiative',
      'social_confidence',
      'empathy_cooperation',
      'structure',
      'autonomy',
    ],
    estimatedMinutes: 24,
    onboardingAsset: {
      id: 'council-of-realms-key-art',
      src: '/images/journeys/council-of-realms.webp',
      responsiveSrc: '/images/journeys/council-of-realms-sm.webp',
      width: 1672,
      height: 941,
      focalPoint: { x: 0.5, y: 0.48 },
      alt: {
        en: 'A circular relief map surrounded by the empty thrones and banners of the Council of Realms',
        es: 'Un mapa circular en relieve rodeado por los tronos y estandartes vacíos del Consejo de los Reinos',
      },
      containsReadableLanguage: false,
      qaStatus: 'approved',
      provenance:
        'Questype commissioned Journey key art, supplied 2026-09-13',
    },
  },
);
