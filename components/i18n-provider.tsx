'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALE_COOKIE, normalizeLocale, type Locale } from '@/src/i18n/locale';

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: 'en', setLocale: () => undefined });

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, updateLocale] = useState(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'es' ? 'Questype — El camino no escrito' : 'Questype — The Unwritten Road';
  }, [locale]);
  const value = useMemo(() => ({
    locale,
    setLocale(next: Locale) {
      updateLocale(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; SameSite=Lax; Max-Age=31536000`;
      document.documentElement.lang = next;
    },
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocalizedSkipLink() {
  const { locale } = useLocale();
  return <a className="skip-link" href="#main">{locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>;
}

export function language(locale: unknown) {
  return normalizeLocale(locale);
}
