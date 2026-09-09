'use client';
import Link from 'next/link';
import { SiteHeader } from '@/components/journey/chrome';
import { useLocale } from '@/components/i18n-provider';
export default function NotFound() {
  const { locale } = useLocale();
  const es = locale === 'es';
  return (
    <>
      <SiteHeader compact />
      <main id="main" className="centered-state">
        <span className="eyebrow">{es ? 'UN GIRO SIN TRAZAR' : 'AN UNCHARTED TURN'}</span>
        <h1>
          {es ? 'Este camino no está' : 'This path isn’t'}
          <br />
          {es ? 'en ' : 'on '}<em>{es ? 'el mapa.' : 'the map.'}</em>
        </h1>
        <Link href="/" className="button button-gold">
          {es ? 'Volver al mundo' : 'Return to the world'}
        </Link>
      </main>
    </>
  );
}
