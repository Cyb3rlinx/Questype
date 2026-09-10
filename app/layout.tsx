import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import { I18nProvider, LocalizedSkipLink } from '@/components/i18n-provider';
import { JourneySoundtrackProvider } from '@/components/journey/soundtrack';
import { LOCALE_COOKIE, normalizeLocale } from '@/src/i18n/locale';
export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return {
    title: locale === 'es' ? 'Questype — El camino no escrito' : 'Questype — The Unwritten Road',
    description: locale === 'es' ? 'Entra en una historia fantástica interactiva. Descubre los arquetipos, fortalezas y motivaciones que revelan tus elecciones.' : 'Step into an interactive fantasy story. Discover the archetypes, strengths and motivations revealed by your choices.',
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return (
    <html lang={locale} className="dark">
      <body>
        <I18nProvider initialLocale={locale}>
          <JourneySoundtrackProvider>
            <LocalizedSkipLink />
            {children}
          </JourneySoundtrackProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
