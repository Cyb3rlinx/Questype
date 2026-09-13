import type { JourneyContent } from '../types.js';
import type { ScoringEngine } from '../scoring/engine.js';
import type { Locale } from '../../i18n/locale.js';
import type { SignalEngine } from '../signals/engine.js';
import type { DraftJourneyServerModel } from './draft-contracts.js';
import { z } from 'zod';

export const JOURNEY_STATUSES = ['draft', 'published', 'retired'] as const;
export const JOURNEY_ACCESS_TIERS = ['free', 'entitlement'] as const;

export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];
export type JourneyAccessTier = (typeof JOURNEY_ACCESS_TIERS)[number];

export interface LocalizedText {
  en: string;
  es: string;
}

export interface VisualAsset {
  id: string;
  src: string;
  responsiveSrc?: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  alt: LocalizedText;
  containsReadableLanguage: false;
  qaStatus: 'pending' | 'approved' | 'repair' | 'replace';
  provenance: string;
}

export interface JourneySceneVisual {
  default: VisualAsset;
  choiceVariants?: Readonly<Record<string, VisualAsset>>;
  inheritsChoiceFrom?: string;
}

export interface JourneyAssetManifest {
  onboarding: VisualAsset;
  processing: VisualAsset;
  scenes: Readonly<
    Record<'man' | 'woman', Readonly<Record<string, JourneySceneVisual>>>
  >;
}

export interface JourneyPublicManifest {
  id: string;
  legacyContentId: string;
  slug: string;
  status: JourneyStatus;
  access: JourneyAccessTier;
  currentVersion: string;
  scoringVersion: string;
  title: LocalizedText;
  shortDescription: LocalizedText;
  assessmentFocus: LocalizedText;
  tags: { en: readonly string[]; es: readonly string[] };
  actNames: { en: readonly string[]; es: readonly string[] };
  focus: readonly string[];
  locales: readonly Locale[];
  sceneCount: number;
  actCount: number;
  estimatedMinutes: number;
  legacyVisualQaException: boolean;
  assets: JourneyAssetManifest;
}

export interface JourneyServerModel {
  content: JourneyContent;
  engine: ScoringEngine;
  signalEngine?: SignalEngine;
  contentHash: string;
  legacyReleaseId: string;
}

export interface JourneyDefinition {
  manifest: JourneyPublicManifest;
  loadServerModel?: () => Promise<JourneyServerModel>;
  loadDraftModel?: () => Promise<DraftJourneyServerModel>;
}

export interface PublicJourneySummary {
  id: string;
  slug: string;
  status: JourneyStatus;
  access: JourneyAccessTier;
  currentVersion: string;
  title: string;
  shortDescription: string;
  assessmentFocus: string;
  tags: readonly string[];
  sceneCount: number;
  actCount: number;
  estimatedMinutes: number;
}

export interface JourneyCardData {
  id: string;
  slug: string;
  status: JourneyStatus;
  access: JourneyAccessTier;
  title: LocalizedText;
  shortDescription: LocalizedText;
  assessmentFocus: LocalizedText;
  tags: { en: readonly string[]; es: readonly string[] };
  sceneCount: number;
  estimatedMinutes: number;
  image: VisualAsset;
}

const localizedTextSchema = z.strictObject({
  en: z.string().min(3),
  es: z.string().min(3),
});
const visualAssetSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9_-]{2,95}$/),
  src: z.string().startsWith('/images/'),
  responsiveSrc: z.string().startsWith('/images/').optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  focalPoint: z.strictObject({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }),
  alt: localizedTextSchema,
  containsReadableLanguage: z.literal(false),
  qaStatus: z.enum(['pending', 'approved', 'repair', 'replace']),
  provenance: z.string().min(5),
});
const sceneVisualSchema = z.strictObject({
  default: visualAssetSchema,
  choiceVariants: z.record(z.string(), visualAssetSchema).optional(),
  inheritsChoiceFrom: z.string().optional(),
});

export const journeyPublicManifestSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
    legacyContentId: z.string().min(3),
    slug: z.string().regex(/^[a-z][a-z0-9-]{2,79}$/),
    status: z.enum(JOURNEY_STATUSES),
    access: z.enum(JOURNEY_ACCESS_TIERS),
    currentVersion: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
    scoringVersion: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
    title: localizedTextSchema,
    shortDescription: localizedTextSchema,
    assessmentFocus: localizedTextSchema,
    tags: z.strictObject({
      en: z.array(z.string().min(2)).min(2).max(8),
      es: z.array(z.string().min(2)).min(2).max(8),
    }),
    actNames: z.strictObject({
      en: z.array(z.string().min(2)).min(1).max(24),
      es: z.array(z.string().min(2)).min(1).max(24),
    }),
    focus: z.array(z.string().min(2)).min(1),
    locales: z.array(z.enum(['en', 'es'])).min(1),
    sceneCount: z.number().int().min(3).max(48),
    actCount: z.number().int().min(1).max(24),
    estimatedMinutes: z.number().int().min(1).max(240),
    legacyVisualQaException: z.boolean(),
    assets: z.strictObject({
      onboarding: visualAssetSchema,
      processing: visualAssetSchema,
      scenes: z.strictObject({
        man: z.record(z.string(), sceneVisualSchema),
        woman: z.record(z.string(), sceneVisualSchema),
      }),
    }),
  })
  .superRefine((manifest, context) => {
    if (
      manifest.actNames.en.length !== manifest.actCount ||
      manifest.actNames.es.length !== manifest.actCount
    )
      context.addIssue({
        code: 'custom',
        path: ['actNames'],
        message: 'Localized act names must match actCount',
      });
    for (const representation of ['man', 'woman'] as const)
      if (
        Object.keys(manifest.assets.scenes[representation]).length !==
        manifest.sceneCount
      )
        context.addIssue({
          code: 'custom',
          path: ['assets', 'scenes', representation],
          message: 'Scene visuals must match sceneCount',
        });
    if (manifest.status === 'published' && !manifest.legacyVisualQaException) {
      const assets = [
        manifest.assets.onboarding,
        manifest.assets.processing,
        ...Object.values(manifest.assets.scenes).flatMap((scenes) =>
          Object.values(scenes).flatMap((visual) => [
            visual.default,
            ...Object.values(visual.choiceVariants ?? {}),
          ]),
        ),
      ];
      if (assets.some((asset) => asset.qaStatus !== 'approved'))
        context.addIssue({
          code: 'custom',
          path: ['assets'],
          message: 'Published Journeys require approved assets',
        });
    }
  });

export function parseJourneyManifest(input: unknown): JourneyPublicManifest {
  return journeyPublicManifestSchema.parse(input) as JourneyPublicManifest;
}
