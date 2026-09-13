'use client';

import { Compass } from 'lucide-react';
import { useLocale } from '../i18n-provider';
import { SiteHeader } from './chrome';
import { JourneyCardGrid } from './cards';
import type { JourneyCardData } from '@/src/domain/journeys/contracts';

export function JourneyCatalog({ journeys }: { journeys: JourneyCardData[] }) {
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
        <p className="catalog-intro">
          {es
            ? 'Cada historia te sitúa ante un tipo diferente de decisión y explora otra parte de la manera en que piensas, actúas y te relacionas.'
            : 'Each story places you inside a different kind of decision and explores another part of how you think, act and relate.'}
        </p>
        <JourneyCardGrid journeys={journeys} />
      </main>
    </div>
  );
}
