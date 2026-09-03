import { z } from 'zod';
import type { StructuredProfile } from '../domain/scoring/profile.js';

export const publicResultSchema = z.strictObject({
  title: z.string().max(100),
  archetypes: z.array(z.strictObject({ name: z.string(), percentage: z.number().int().min(0).max(100) })).min(1).max(3),
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
export function createPublicProjection(profile: StructuredProfile, selection: { includeName: boolean; topCount: 1 | 2 | 3; quote: string; imageUrl: string | null }): PublicResult {
  if (![1, 2, 3].includes(selection.topCount)) throw new Error('Select one to three archetypes');
  return publicResultSchema.parse({ title: profile.character.title,
    archetypes: profile.archetypes.all.slice(0, selection.topCount).map(a => ({ name: a.name, percentage: a.normalized_percentage })),
    quote: selection.quote, image_url: selection.imageUrl, display_name: selection.includeName ? profile.user.name : null,
  });
}
