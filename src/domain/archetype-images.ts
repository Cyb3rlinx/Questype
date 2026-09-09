import type { ArchetypeKey, Gender } from './types.js';
import type { Locale } from '../i18n/locale.js';
import { archetypeName } from '../i18n/archetypes.js';

export function archetypeImage(slug: ArchetypeKey, gender: Gender) {
  return `/images/archetypes/${slug}-${gender}.webp`;
}

export function archetypeImageAlt(slug: ArchetypeKey, fallbackName: string, gender: Gender, locale: Locale) {
  const name = archetypeName(slug, fallbackName, locale);
  if (locale === 'es') return `${gender === 'woman' ? 'Viajera' : 'Viajero'} que representa el arquetipo ${name}`;
  return `${gender === 'woman' ? 'Woman' : 'Man'} representing the ${name} archetype`;
}
