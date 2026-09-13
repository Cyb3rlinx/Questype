'use client';

import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import { useLocale } from '../i18n-provider';
import type { JourneyCardData } from '@/src/domain/journeys/contracts';

export function JourneyCardGrid({
  journeys,
}: {
  journeys: readonly JourneyCardData[];
}) {
  const { locale } = useLocale();
  const es = locale === 'es';
  return (
    <div className="journey-card-grid">
      {journeys.map((journey, index) => {
        const available = journey.status === 'published';
        return (
          <article className="journey-card" key={journey.id}>
            <div className="journey-card-image">
              {/* oxlint-disable-next-line next/no-img-element -- the manifest owns responsive sources, fixed dimensions and visual QA */}
              <img
                src={journey.image.src}
                srcSet={
                  journey.image.responsiveSrc
                    ? `${journey.image.responsiveSrc} 900w, ${journey.image.src} ${journey.image.width}w`
                    : undefined
                }
                sizes="(max-width: 760px) 100vw, 33vw"
                width={journey.image.width}
                height={journey.image.height}
                alt={journey.image.alt[locale]}
                loading="lazy"
                decoding="async"
              />
              <div className="journey-card-image-shade" />
              <span
                className={`journey-status ${available ? 'available' : 'coming'}`}
              >
                {available
                  ? es
                    ? 'Disponible'
                    : 'Available'
                  : es
                    ? 'En desarrollo'
                    : 'In development'}
              </span>
              <span className="journey-card-number">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="journey-card-copy">
              <span className="eyebrow">{journey.assessmentFocus[locale]}</span>
              <h3>{journey.title[locale]}</h3>
              <p>{journey.shortDescription[locale]}</p>
              <div
                className="journey-card-tags"
                aria-label={es ? 'Temas' : 'Themes'}
              >
                {journey.tags[locale].map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <small>
                <Clock3 size={14} /> {journey.sceneCount}{' '}
                {es ? 'momentos' : 'moments'} · {journey.estimatedMinutes} min
              </small>
              {available ? (
                <Link
                  className="button button-gold"
                  href={`/journey/${journey.slug}/start`}
                >
                  {es ? 'Comenzar el Journey' : 'Begin the Journey'}{' '}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span
                  className="button button-outline journey-disabled"
                  aria-disabled="true"
                >
                  {es ? 'Próximamente' : 'Coming soon'}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
