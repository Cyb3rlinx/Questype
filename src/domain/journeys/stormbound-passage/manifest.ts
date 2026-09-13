import { buildDraftManifest } from '../draft-manifest.js';
import { stormboundPassageMetadata } from './metadata.js';

export const stormboundPassageManifest = buildDraftManifest(
  stormboundPassageMetadata,
  {
    description: {
      en: 'A violent storm cuts your expedition off from safety. Limited resources, uncertainty and difficult trade-offs reveal how you respond when no option is perfect.',
      es: 'Una tormenta violenta separa a tu expedición de la seguridad. Los recursos limitados, la incertidumbre y las decisiones difíciles revelan cómo respondes cuando ninguna opción es perfecta.',
    },
    assessmentFocus: {
      en: 'Decision-Making Under Pressure',
      es: 'Toma de decisiones bajo presión',
    },
    tags: {
      en: [
        'Risk',
        'Adaptability',
        'Persistence',
        'Emotional Regulation',
        'Decision Style',
      ],
      es: [
        'Riesgo',
        'Adaptabilidad',
        'Persistencia',
        'Regulación emocional',
        'Estilo de decisión',
      ],
    },
    focus: [
      'risk_tolerance',
      'adaptability',
      'persistence',
      'emotional_regulation',
    ],
    estimatedMinutes: 24,
    onboardingAsset: {
      id: 'stormbound-passage-key-art',
      src: '/images/journeys/stormbound-passage.webp',
      responsiveSrc: '/images/journeys/stormbound-passage-sm.webp',
      width: 1672,
      height: 941,
      focalPoint: { x: 0.58, y: 0.5 },
      alt: {
        en: 'A storm-battered mountain passage leading toward a distant fortress',
        es: 'Un paso de montaña azotado por la tormenta conduce hacia una fortaleza lejana',
      },
      containsReadableLanguage: false,
      qaStatus: 'approved',
      provenance:
        'Questype commissioned Journey key art, supplied 2026-09-13',
    },
  },
);
