export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = 'archetype_locale';

export function normalizeLocale(value: unknown): Locale {
  return value === 'es' ? 'es' : 'en';
}

export function localeFromRequest(request: Request): Locale {
  const value = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  return normalizeLocale(value);
}
