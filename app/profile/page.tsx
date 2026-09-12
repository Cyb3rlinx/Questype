'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Layers3, ShieldCheck } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/journey/chrome';
import { useLocale } from '@/components/i18n-provider';
import { requestJson } from '@/lib/client-api';
import { downloadProfileReport } from '@/lib/export-assets';
import type { ProfileReportData } from '@/src/profile/report';

interface ProfileView {
  user: { email: string; displayName: string | null };
  snapshot: null | {
    id: string;
    sequence: number;
    journeysCompleted: number;
    decisionsAnalyzed: number;
    profileDepth: string;
    createdAt: string;
    signals: Array<{
      id: string;
      label: string;
      definition: string;
      status: 'measured' | 'unexplored';
      band: string;
      pattern: string;
      indicatorPosition: number | null;
      observations: number;
      journeys: number;
      contexts: string[];
    }>;
  };
  timeline: Array<{
    resultId: string;
    date: string;
    title: string;
    focus: string;
    resultSummary: string;
    resultUrl: string;
  }>;
}

export default function ProfilePage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const [view, setView] = useState<ProfileView | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          setAnonymous(true);
          return null;
        }
        const data = (await response.json()) as ProfileView & {
          error?: string;
        };
        if (!response.ok) throw new Error(data.error ?? 'Profile unavailable');
        return data;
      })
      .then((data) => data && setView(data))
      .catch((reason) => setError((reason as Error).message));
  }, []);

  async function download() {
    setBusy(true);
    setError('');
    try {
      const report = await requestJson<ProfileReportData>(
        '/api/profile/report',
      );
      await downloadProfileReport(report);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const measured =
    view?.snapshot?.signals.filter((signal) => signal.status === 'measured') ??
    [];
  const unexplored =
    view?.snapshot?.signals.filter(
      (signal) => signal.status === 'unexplored',
    ) ?? [];
  const depth: Record<string, string> = es
    ? {
        initial: 'Inicial',
        emerging: 'Emergente',
        established: 'Establecido',
        extensive: 'Extenso',
      }
    : {
        initial: 'Initial',
        emerging: 'Emerging',
        established: 'Established',
        extensive: 'Extensive',
      };

  return (
    <>
      <SiteHeader compact />
      <main id="main" className="profile-page page-width">
        <header className="profile-hero">
          <Layers3 size={38} strokeWidth={1} />
          <span className="eyebrow">
            {es ? 'TU PERFIL QUESTYPE' : 'YOUR QUESTYPE PROFILE'}
          </span>
          <h1>
            {es ? 'Distintos mundos.' : 'Different worlds.'}
            <br />
            <em>{es ? 'Una imagen más profunda.' : 'A deeper picture.'}</em>
          </h1>
          <p>
            {es
              ? 'Cada Journey observa tus decisiones en un contexto diferente. Tu perfil reúne solo los patrones respaldados por evidencia suficiente.'
              : 'Each Journey observes your decisions in a different context. Your profile brings together only patterns supported by enough evidence.'}
          </p>
        </header>

        {anonymous ? (
          <section className="profile-empty">
            <ShieldCheck size={30} strokeWidth={1} />
            <h2>
              {es
                ? 'Tu viaje puede seguir siendo anónimo.'
                : 'Your journey can stay anonymous.'}
            </h2>
            <p>
              {es
                ? 'Inicia sesión solo si quieres reunir resultados de distintos dispositivos y Journeys.'
                : 'Sign in only if you want to gather results across devices and Journeys.'}
            </p>
            <Link className="button button-gold" href="/account">
              {es ? 'Abrir cuenta opcional' : 'Open optional account'}
            </Link>
          </section>
        ) : !view ? (
          <p className="profile-loading">
            {error ||
              (es ? 'Construyendo tu perfil…' : 'Building your profile…')}
          </p>
        ) : !view.snapshot ? (
          <section className="profile-empty">
            <h2>
              {es
                ? 'Aún no hay evidencia acumulada.'
                : 'No accumulated evidence yet.'}
            </h2>
            <p>
              {es
                ? 'Completa un Journey o reclama un resultado guardado en este navegador.'
                : 'Complete a Journey or claim a result saved in this browser.'}
            </p>
            <div className="account-actions">
              <Link className="button button-gold" href="/journeys">
                {es ? 'Elegir un Journey' : 'Choose a Journey'}
              </Link>
              <Link className="button button-outline" href="/account">
                {es ? 'Reclamar resultados' : 'Claim results'}
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="profile-overview">
              <div>
                <small>{es ? 'Profundidad del perfil' : 'Profile depth'}</small>
                <strong>
                  {depth[view.snapshot.profileDepth] ??
                    view.snapshot.profileDepth}
                </strong>
              </div>
              <div>
                <small>Journeys</small>
                <strong>{view.snapshot.journeysCompleted}</strong>
              </div>
              <div>
                <small>
                  {es ? 'Decisiones analizadas' : 'Decisions analyzed'}
                </small>
                <strong>{view.snapshot.decisionsAnalyzed}</strong>
              </div>
              <button
                className="button button-gold"
                disabled={busy}
                onClick={download}
              >
                <Download size={16} />
                {busy
                  ? es
                    ? 'Preparando…'
                    : 'Preparing…'
                  : es
                    ? 'Descargar perfil'
                    : 'Download profile'}
              </button>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <span className="eyebrow">
                  {es ? 'DIMENSIONES CENTRALES' : 'CORE DIMENSIONS'}
                </span>
                <h2>
                  {es
                    ? 'Lo que tus decisiones sugieren.'
                    : 'What your choices suggest.'}
                </h2>
                <p>
                  {es
                    ? 'La posición muestra dirección narrativa, no un porcentaje de personalidad ni una comparación con otras personas.'
                    : 'The position shows narrative direction, not a personality percentage or a comparison with other people.'}
                </p>
              </div>
              <div className="profile-signal-grid">
                {measured.map((signal) => (
                  <article className="profile-signal" key={signal.id}>
                    <div className="profile-signal-title">
                      <h3>{signal.label}</h3>
                      <span>{signal.band}</span>
                    </div>
                    <div className="signal-axis" aria-hidden="true">
                      <span className="signal-center" />
                      <span
                        className="signal-marker"
                        style={{ left: `${signal.indicatorPosition}%` }}
                      />
                    </div>
                    <strong>{signal.pattern}</strong>
                    <p>{signal.definition}</p>
                    {signal.contexts.length > 0 && (
                      <small>
                        {es ? 'Contextos observados: ' : 'Observed contexts: '}
                        {signal.contexts.join(', ')}
                      </small>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {unexplored.length > 0 && (
              <section className="profile-unexplored">
                <h2>
                  {es
                    ? 'Áreas que todavía necesitan contexto'
                    : 'Areas that still need context'}
                </h2>
                <p>{unexplored.map((signal) => signal.label).join(' · ')}</p>
                <Link className="text-link" href="/journeys">
                  {es ? 'Explorar otros Journeys' : 'Explore other Journeys'}{' '}
                  <ArrowRight size={15} />
                </Link>
              </section>
            )}

            <section className="profile-section profile-timeline-section">
              <div className="profile-section-heading">
                <span className="eyebrow">
                  {es ? 'TU RECORRIDO' : 'YOUR JOURNEY TIMELINE'}
                </span>
                <h2>
                  {es
                    ? 'Cada resultado conserva su historia.'
                    : 'Every result keeps its own story.'}
                </h2>
              </div>
              <div className="profile-timeline">
                {view.timeline.map((item) => (
                  <article key={item.resultId}>
                    <time>
                      {new Date(item.date).toLocaleDateString(locale)}
                    </time>
                    <h3>{item.title}</h3>
                    <p>{item.resultSummary}</p>
                    <Link className="text-link" href={item.resultUrl}>
                      {es ? 'Ver resultado' : 'View result'}{' '}
                      <ArrowRight size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {error && view && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <p className="profile-scope-note">
          {es
            ? 'Questype está diseñado para la reflexión y el autoconocimiento. No es un diagnóstico clínico ni sustituye una evaluación psicológica profesional.'
            : 'Questype is designed for reflection and personal insight. It is not a clinical diagnosis or a substitute for professional psychological assessment.'}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
