import { z } from 'zod';
import type { StructuredProfile } from '../domain/scoring/profile.js';
import { archetypeName, localizedCharacterTitle } from '../i18n/archetypes.js';
import type { Locale } from '../i18n/locale.js';

export const publicResultSchema = z.strictObject({
  locale: z.enum(['en', 'es']),
  title: z.string().max(100),
  archetypes: z.array(z.strictObject({ name: z.string(), percentage: z.number().int().min(0).max(100) })).min(1).max(2),
  quote: z.string().max(200), image_url: z.url().nullable(), display_name: z.string().max(60).nullable(),
});
export type PublicResult = z.infer<typeof publicResultSchema>;
export const CARD_FORMATS = {
  instagram_portrait: { platform: 'instagram', format: 'portrait', width: 1080, height: 1350 },
  instagram_story: { platform: 'instagram', format: 'story', width: 1080, height: 1920 },
  linkedin: { platform: 'linkedin', format: 'professional', width: 1200, height: 627 },
  x: { platform: 'x', format: 'compact', width: 1200, height: 675 },
} as const;
export type CardFormat = keyof typeof CARD_FORMATS;
export interface SocialCardData { format: CardFormat; result: PublicResult; share_url: string; branding: string }

/** Explicit allow-list projection. A future authenticated service must persist consent and create the share URL. */
export function createPublicProjection(profile: StructuredProfile, selection: { includeName: boolean; topCount: 1 | 2; quote: string; imageUrl: string | null; locale?: Locale }): PublicResult {
  if (![1, 2].includes(selection.topCount)) throw new Error('Select one or two archetypes');
  const locale = selection.locale ?? 'en';
  return publicResultSchema.parse({ locale, title: localizedCharacterTitle(profile, locale),
    archetypes: profile.archetypes.all.slice(0, selection.topCount).map(a => ({ name: archetypeName(a.slug, a.name, locale), percentage: a.normalized_percentage })),
    quote: selection.quote, image_url: selection.imageUrl, display_name: selection.includeName ? profile.user.name : null,
  });
}

const legacyPublicResultSchema = publicResultSchema.extend({
  locale: z.enum(['en', 'es']).optional(),
  archetypes: z.array(z.strictObject({ name: z.string(), percentage: z.number().int().min(0).max(100) })).min(1).max(3),
});

/** Keeps previously shared three-archetype cards readable while enforcing the new two-archetype maximum. */
export function readPublicProjection(input: unknown): PublicResult {
  const legacy = legacyPublicResultSchema.parse(input);
  return publicResultSchema.parse({
    ...legacy,
    locale: legacy.locale ?? 'en',
    archetypes: legacy.archetypes.slice(0, 2),
  });
}
