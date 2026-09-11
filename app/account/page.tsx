'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/journey/chrome';
import { useLocale } from '@/components/i18n-provider';
import { requestJson } from '@/lib/client-api';

interface AccountOverview {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    locale: 'en' | 'es';
    createdAt: number;
  };
  results: number;
  journeys: number;
}

export default function AccountPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [developmentUrl, setDevelopmentUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch('/api/account', { cache: 'no-store' });
    if (response.status === 401) {
      setAccount(null);
      setChecked(true);
      return;
    }
    const data = (await response.json()) as AccountOverview & {
      error?: string;
    };
    if (!response.ok) throw new Error(data.error ?? 'Account unavailable');
    setAccount(data);
    setDisplayName(data.user.displayName ?? '');
    setChecked(true);
  }

  useEffect(() => {
    refresh().catch((error) => {
      setMessage((error as Error).message);
      setChecked(true);
    });
  }, []);

  async function sendLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setDevelopmentUrl('');
    try {
      const result = await requestJson<{
        accepted: true;
        development_verify_url?: string;
      }>('/api/auth/request-link', 'POST', { email });
      setMessage(
        es
          ? 'Si el correo puede recibir el enlace, llegará en unos minutos.'
          : 'If the address can receive the link, it will arrive in a few minutes.',
      );
      setDevelopmentUrl(result.development_verify_url ?? '');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await requestJson<AccountOverview>(
        '/api/account',
        'PATCH',
        {
          display_name: displayName.trim() || null,
          locale,
        },
      );
      setAccount(result);
      setMessage(es ? 'Perfil actualizado.' : 'Profile updated.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    setBusy(true);
    setMessage('');
    try {
      const result = await requestJson<{
        claimed: number;
        already_owned: number;
      }>('/api/account/claim', 'POST', {});
      await refresh();
      setMessage(
        es
          ? `${result.claimed} resultado(s) de este navegador añadidos a tu perfil.`
          : `${result.claimed} result(s) from this browser added to your profile.`,
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await requestJson('/api/auth/sign-out', 'POST', {});
    window.location.reload();
  }

  async function removeAccount() {
    const approved = window.confirm(
      es
        ? '¿Eliminar tu cuenta, resultados reclamados y enlaces compartidos? Esta acción no se puede deshacer.'
        : 'Delete your account, claimed results and share links? This cannot be undone.',
    );
    if (!approved) return;
    setBusy(true);
    await requestJson('/api/account', 'DELETE');
    window.location.href = '/';
  }

  return (
    <>
      <SiteHeader compact />
      <main id="main" className="account-page page-width">
        <div className="account-intro">
          <UserRound size={38} strokeWidth={1} />
          <span className="eyebrow">
            {es ? 'TU PERFIL QUESTYPE' : 'YOUR QUESTYPE PROFILE'}
          </span>
          <h1>
            {es ? 'Tus historias,' : 'Your stories,'}
            <br />
            <em>{es ? 'un solo perfil.' : 'one evolving profile.'}</em>
          </h1>
          <p>
            {es
              ? 'La cuenta es opcional. Te permite conservar los resultados de este navegador y reunir evidencia de futuros Journeys.'
              : 'An account is optional. It lets you preserve results from this browser and gather evidence from future Journeys.'}
          </p>
        </div>

        {!checked ? (
          <p>{es ? 'Consultando tu perfil…' : 'Checking your profile…'}</p>
        ) : account ? (
          <section className="account-panel">
            <div className="account-summary">
              <ShieldCheck size={25} strokeWidth={1.2} />
              <div>
                <strong>{account.user.email}</strong>
                <small>
                  {account.journeys} {es ? 'Journeys' : 'Journeys'} ·{' '}
                  {account.results} {es ? 'resultados' : 'results'}
                </small>
              </div>
            </div>
            <form onSubmit={saveAccount} className="account-form">
              <label htmlFor="display-name">
                {es ? 'Nombre visible opcional' : 'Optional display name'}
              </label>
              <input
                id="display-name"
                maxLength={80}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <button className="button button-gold" disabled={busy}>
                {es ? 'Guardar' : 'Save'}
              </button>
            </form>
            <div className="account-actions">
              <button
                className="button button-outline"
                disabled={busy}
                onClick={claim}
              >
                {es
                  ? 'Añadir resultados de este navegador'
                  : 'Add results from this browser'}
              </button>
              <Link className="button button-gold" href="/profile">
                {es ? 'Ver perfil acumulativo' : 'View accumulated profile'}
              </Link>
            </div>
            <div className="account-quiet-actions">
              <button disabled={busy} onClick={signOut}>
                <LogOut size={15} /> {es ? 'Cerrar sesión' : 'Sign out'}
              </button>
              <button disabled={busy} onClick={removeAccount}>
                {es ? 'Eliminar cuenta y datos' : 'Delete account and data'}
              </button>
            </div>
          </section>
        ) : (
          <section className="account-panel">
            <KeyRound size={28} strokeWidth={1.1} />
            <h2>
              {es ? 'Entra sin contraseña' : 'Sign in without a password'}
            </h2>
            <p>
              {es
                ? 'Te enviaremos un enlace de un solo uso. Puedes seguir usando Questype sin crear una cuenta.'
                : 'We’ll send a single-use link. You can keep using Questype without creating an account.'}
            </p>
            <form onSubmit={sendLink} className="account-form">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="button button-gold" disabled={busy}>
                {busy
                  ? es
                    ? 'Preparando…'
                    : 'Preparing…'
                  : es
                    ? 'Recibir enlace seguro'
                    : 'Send secure link'}
              </button>
            </form>
            {developmentUrl && (
              <Link className="text-link" href={developmentUrl}>
                {es
                  ? 'Abrir enlace local de desarrollo'
                  : 'Open local development link'}
              </Link>
            )}
          </section>
        )}
        {message && (
          <p className="account-message" role="status">
            {message}
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
