'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/journey/chrome';
import { useLocale } from '@/components/i18n-provider';
import { requestJson } from '@/lib/client-api';

export default function VerifyMagicLinkPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = new URL(window.location.href).searchParams.get('token');
    if (!token) {
      setState('error');
      setMessage(
        es
          ? 'Este enlace no contiene un token válido.'
          : 'This link has no valid token.',
      );
      return;
    }
    requestJson('/api/auth/verify', 'POST', { token })
      .then(async () => {
        try {
          await requestJson('/api/account/claim', 'POST', {});
        } catch {
          // Signing in remains successful when this browser has nothing to claim.
        }
        setState('done');
        setMessage(es ? 'Tu cuenta está lista.' : 'Your account is ready.');
      })
      .catch((error) => {
        setState('error');
        setMessage((error as Error).message);
      });
  }, [es]);

  return (
    <>
      <SiteHeader compact />
      <main id="main" className="centered-state auth-verify-state">
        <KeyRound size={42} strokeWidth={1} />
        <span className="eyebrow">
          {es ? 'ACCESO SEGURO' : 'SECURE SIGN-IN'}
        </span>
        <h1>
          {state === 'working'
            ? es
              ? 'Abriendo tu perfil…'
              : 'Opening your profile…'
            : message}
        </h1>
        {state === 'done' && (
          <Link className="button button-gold" href="/profile">
            {es ? 'Ver mi perfil' : 'View my profile'}
          </Link>
        )}
        {state === 'error' && (
          <Link className="button button-outline" href="/account">
            {es ? 'Solicitar otro enlace' : 'Request another link'}
          </Link>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
