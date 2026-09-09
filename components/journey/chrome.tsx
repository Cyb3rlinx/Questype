'use client';
import Link from 'next/link';
import { Compass, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../i18n-provider';
export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  const es = locale === 'es';
  return <div className="language-switch" role="group" aria-label={es ? 'Idioma' : 'Language'}>
    <button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')} aria-pressed={locale === 'en'}>EN</button>
    <span>/</span>
    <button className={locale === 'es' ? 'active' : ''} onClick={() => setLocale('es')} aria-pressed={locale === 'es'}>ES</button>
  </div>;
}
export function Brand() {
  const { locale } = useLocale();
  return (
    <Link href="/" className="brand" aria-label={locale === 'es' ? 'Inicio de Questype' : 'Questype home'}>
      <Compass size={29} strokeWidth={1.1} />
      <span>
        QUESTYPE<small>{locale === 'es' ? 'LA HISTORIA INTERIOR' : 'THE STORY WITHIN'}</small>
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
  const { locale, setLocale } = useLocale();
  const es = locale === 'es';
  return (
    <header className={`site-header ${overlay ? 'overlay-header' : ''}`}>
      <div className="header-inner page-width">
        <Brand />
        {!compact && (
          <nav aria-label={es ? 'Navegación principal' : 'Main navigation'}>
            <Link href="/#experience">{es ? 'La experiencia' : 'The experience'}</Link>
            <Link href="/#archetypes">{es ? 'Los arquetipos' : 'The archetypes'}</Link>
            <Link href="/#how-it-works">{es ? 'Tu viaje' : 'Your journey'}</Link>
          </nav>
        )}
        <LanguageSwitch />
        <Link href={compact ? '/' : '/start'} className="header-action">
          {compact ? (es ? 'Volver al mundo' : 'Back to the world') : (es ? 'Comienza tu viaje' : 'Begin your journey')}
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
    <footer className="site-footer page-width">
      <div>
        <Brand />
        <p>{es ? 'Una aventura de autodescubrimiento.' : 'An adventure in self-discovery.'}</p>
      </div>
      <p className="footer-notice">
        {es ? 'Para la reflexión personal y el entretenimiento.' : 'For self-reflection and entertainment.'}
        <br />
        {es ? 'Esta experiencia no ofrece diagnósticos psicológicos ni médicos.' : 'This experience does not provide psychological or medical diagnosis.'}
      </p>
      <Link href="/privacy">{es ? 'Privacidad y tus decisiones' : 'Privacy & your choices'}</Link>
    </footer>
  );
}
