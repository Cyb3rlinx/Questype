import { createHash } from 'node:crypto';
import type { JourneyContent } from '../domain/types.js';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, v]) => [key, canonical(v)]));
  return value;
}
export function contentHash(content: JourneyContent): string {
  return createHash('sha256').update(JSON.stringify(canonical(content))).digest('hex');
}
export function contentVersionId(content: Pick<JourneyContent, 'id' | 'journey_version'>): string {
  const hex = createHash('sha256').update(`${content.id}:${content.journey_version}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
