'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { SiteHeader } from './chrome';
import { requestJson, type SessionView } from '@/lib/client-api';
import { useLocale } from '@/components/i18n-provider';

interface ProcessingProps {
  journeySlug: string;
  processingAsset: {
    src: string;
    responsiveSrc?: string;
    width: number;
    height: number;
    alt: { en: string; es: string };
    focalPoint: { x: number; y: number };
  };
}

export function JourneyProcessing({
  journeySlug,
  processingAsset,
}: ProcessingProps) {
  const { locale } = useLocale();
  const es = locale === 'es';
  const router = useRouter();
  const [error, setError] = useState('');
  const active = useRef(false);

  const reveal = useCallback(async () => {
    if (active.current) return;
    active.current = true;
    setError('');
    try {
      const session = await requestJson<SessionView>(
        `/api/session?journey_slug=${encodeURIComponent(journeySlug)}`,
      );
      if (session.result_id) {
        router.replace(`/result/${session.result_id}`);
        return;
      }
      if (session.status === 'in_progress') {
        router.replace(`/journey/${session.journey.slug}/play`);
        return;
      }
      const result = await requestJson<{ result_id: string }>(
        '/api/session/complete',
        'POST',
        { session_id: session.id },
      );
      router.replace(`/result/${result.result_id}`);
    } catch (cause) {
      setError((cause as Error).message);
      active.current = false;
    }
  }, [journeySlug, router]);

  useEffect(() => {
    queueMicrotask(() => void reveal());
  }, [reveal]);

  return (
    <div className="processing-page">
      <img
        src={processingAsset.src}
        srcSet={
          processingAsset.responsiveSrc
            ? `${processingAsset.responsiveSrc} 900w, ${processingAsset.src} ${processingAsset.width}w`
            : undefined
        }
        sizes="100vw"
        width={processingAsset.width}
        height={processingAsset.height}
        fetchPriority="high"
        alt={processingAsset.alt[locale]}
        style={{
          objectPosition: `${processingAsset.focalPoint.x * 100}% ${processingAsset.focalPoint.y * 100}%`,
        }}
      />
      <div className="processing-shade" />
      <SiteHeader compact />
      <main id="main" className="centered-state">
        <div className={`reveal-compass ${error ? '' : 'turning'}`}>
          <Compass size={65} strokeWidth={0.8} />
        </div>
        <span className="eyebrow">
          {es
            ? 'LA MELODÍA SE DESVANECE. LA CARTA PERMANECE.'
            : 'THE MELODY FADES. THE LETTER REMAINS.'}
        </span>
        <h1>
          {es ? 'Despiertas donde' : 'You wake where'}
          <br />
          <em>{es ? 'comenzó el viaje.' : 'the journey began.'}</em>
        </h1>
        <p>
          {es
            ? 'La misma habitación. La misma carta. Esta vez, el camino continúa dentro de ti.'
            : 'The same room. The same letter. This time, the road is still inside you.'}
        </p>
        {error && (
          <>
            <p className="error-message" role="alert">
              {error}
            </p>
            <button onClick={reveal} className="button button-gold">
              {es ? 'Intentar la revelación otra vez' : 'Try the reveal again'}{' '}
              <ArrowRight size={16} />
            </button>
            <Link href={`/journey/${journeySlug}/play`} className="text-link">
              {es ? 'Volver a tu viaje' : 'Return to your journey'}
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
