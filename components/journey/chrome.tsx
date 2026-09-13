'use client';
import Link from 'next/link';
import { Compass, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../i18n-provider';
export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  const es = locale === 'es';
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={es ? 'Idioma' : 'Language'}
    >
      <button
        className={locale === 'en' ? 'active' : ''}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <span>/</span>
      <button
        className={locale === 'es' ? 'active' : ''}
        onClick={() => setLocale('es')}
        aria-pressed={locale === 'es'}
      >
        ES
      </button>
    </div>
  );
}
export function Brand() {
  const { locale } = useLocale();
  return (
    <Link
      href="/"
      className="brand"
      aria-label={locale === 'es' ? 'Inicio de Questype' : 'Questype home'}
    >
      <Compass size={29} strokeWidth={1.1} />
      <span>
        QUESTYPE
        <small>
          {locale === 'es' ? 'LA HISTORIA INTERIOR' : 'THE STORY WITHIN'}
        </small>
      </span>
    </Link>
  );
}
export function SiteHeader({
  overlay = false,
  compact = false,
}: {
  overlay?: boolean;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const es = locale === 'es';
  return (
    <header className={`site-header ${overlay ? 'overlay-header' : ''}`}>
      <div className="header-inner page-width">
        <Brand />
        {!compact && (
          <nav aria-label={es ? 'Navegación principal' : 'Main navigation'}>
            <Link href="/#experience">
              {es ? 'La experiencia' : 'The experience'}
            </Link>
            <Link href="/journeys">Journeys</Link>
          </nav>
        )}
        <LanguageSwitch />
        <Link href={compact ? '/' : '/start'} className="header-action">
          <span className="header-action-label">
            {compact
              ? es
                ? 'Volver al mundo'
                : 'Back to the world'
              : es
                ? 'Comienza tu viaje'
                : 'Begin your journey'}
          </span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}
export function SiteFooter() {
  const { locale } = useLocale();
  const es = locale === 'es';
  return (
    <footer id="site-footer" className="site-footer">
      <div className="footer-media" aria-hidden="true">
        <video
          className="footer-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="footer-shade" aria-hidden="true" />
      <div className="footer-inner page-width">
        <div className="footer-ornament" aria-hidden="true">
          <span />
          <Compass size={22} strokeWidth={1} />
          <span />
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              {es
                ? 'Una aventura de autodescubrimiento.'
                : 'An adventure in self-discovery.'}
            </p>
          </div>

          <div className="footer-reflection">
            <p className="footer-notice">
              {es
                ? 'Para la reflexión personal y el entretenimiento.'
                : 'For self-reflection and entertainment.'}
              <br />
              {es
                ? 'Esta experiencia no ofrece diagnósticos psicológicos ni médicos.'
                : 'This experience does not provide psychological or medical diagnosis.'}
            </p>
            <Link href="/privacy" className="footer-privacy-link">
              {es ? 'Privacidad y tus decisiones' : 'Privacy & your choices'}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
