'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/journey/chrome';
import { requestJson, type SessionView } from '@/lib/client-api';
import { useLocale } from '@/components/i18n-provider';
export default function ProcessingPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const router = useRouter();
  const [error, setError] = useState('');
  const active = useRef(false);
  async function reveal() {
    if (active.current) return;
    active.current = true;
    setError('');
    try {
      const session = await requestJson<SessionView>('/api/session');
      if (session.result_id) {
        router.replace(`/result/${session.result_id}`);
        return;
      }
      if (session.status === 'in_progress') {
        router.replace('/journey');
        return;
      }
      const result = await requestJson<{ result_id: string }>(
        '/api/session/complete',
        'POST',
        { session_id: session.id },
      );
      router.replace(`/result/${result.result_id}`);
    } catch (e) {
      setError((e as Error).message);
      active.current = false;
    }
  }
  useEffect(() => {
    void reveal();
  }, []);
  return (
    <div className="processing-page">
      <img
        src="/images/ridge-beacon.webp"
        alt={es ? 'Un faro sobre un valle silencioso' : 'A beacon overlooking a quiet valley'}
      />
      <div className="processing-shade" />
      <SiteHeader compact />
      <main id="main" className="centered-state">
        <div className={`reveal-compass ${error ? '' : 'turning'}`}>
          <Compass size={65} strokeWidth={0.8} />
        </div>
        <span className="eyebrow">{es ? 'LA MELODÍA SE DESVANECE. LA CARTA PERMANECE.' : 'THE MELODY FADES. THE LETTER REMAINS.'}</span>
        <h1>
          {es ? 'Despiertas donde' : 'You wake where'}
          <br />
          <em>{es ? 'comenzó el viaje.' : 'the journey began.'}</em>
        </h1>
        <p>{es ? 'La misma habitación. La misma carta. Esta vez, el camino continúa dentro de ti.' : 'The same room. The same letter. This time, the road is still inside you.'}</p>
        {error && (
          <>
            <p className="error-message" role="alert">
              {error}
            </p>
            <button onClick={reveal} className="button button-gold">
              {es ? 'Intentar la revelación otra vez' : 'Try the reveal again'} <ArrowRight size={16} />
            </button>
            <Link href="/journey" className="text-link">
              {es ? 'Volver a tu viaje' : 'Return to your journey'}
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
