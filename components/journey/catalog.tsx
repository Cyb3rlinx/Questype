'use client';

import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { useLocale } from '../i18n-provider';
import { SiteHeader } from './chrome';

interface CatalogJourney {
  id: string;
  slug: string;
  status: 'draft' | 'published' | 'retired';
  access: 'free' | 'entitlement';
  title: { en: string; es: string };
  shortDescription: { en: string; es: string };
  sceneCount: number;
  estimatedMinutes: number;
}

export function JourneyCatalog({ journeys }: { journeys: CatalogJourney[] }) {
  const { locale } = useLocale();
  const es = locale === 'es';
  return (
    <div className="flow-page">
      <SiteHeader />
      <main id="main" className="centered-state">
        <Compass size={44} strokeWidth={1} />
        <span className="eyebrow">
          {es ? 'HISTORIAS PARA RECORRER' : 'STORIES TO TRAVEL'}
        </span>
        <h1>{es ? 'Elige tu próximo camino.' : 'Choose your next road.'}</h1>
        <div className="journey-catalog">
          {journeys.map((journey) => (
            <article className="journey-catalog-card" key={journey.id}>
              <span className="eyebrow">
                {journey.access === 'free'
                  ? es
                    ? 'VIAJE GRATUITO'
                    : 'FREE JOURNEY'
                  : es
                    ? 'VIAJE PREMIUM'
                    : 'PREMIUM JOURNEY'}
              </span>
              <h2>{journey.title[locale]}</h2>
              <p>{journey.shortDescription[locale]}</p>
              <small>
                {journey.sceneCount} {es ? 'momentos' : 'moments'} ·{' '}
                {journey.estimatedMinutes} min
              </small>
              <Link
                className="button button-gold"
                href={`/journey/${journey.slug}/start`}
              >
                {es ? 'Entrar en la historia' : 'Enter the story'}{' '}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
