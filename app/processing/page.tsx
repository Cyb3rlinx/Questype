'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/journey/chrome';
import { requestJson, type SessionView } from '@/lib/client-api';
export default function ProcessingPage() {
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
        alt="A beacon overlooking a quiet valley"
      />
      <div className="processing-shade" />
      <SiteHeader compact />
      <main id="main" className="centered-state">
        <div className={`reveal-compass ${error ? '' : 'turning'}`}>
          <Compass size={65} strokeWidth={0.8} />
        </div>
        <span className="eyebrow">FIFTEEN MOMENTS. ONE UNWRITTEN STORY.</span>
        <h1>
          The road has revealed
          <br />
          <em>a little more of you.</em>
        </h1>
        <p>Gathering the threads of your choices…</p>
        {error && (
          <>
            <p className="error-message" role="alert">
              {error}
            </p>
            <button onClick={reveal} className="button button-gold">
              Try the reveal again <ArrowRight size={16} />
            </button>
            <Link href="/journey" className="text-link">
              Return to your journey
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
