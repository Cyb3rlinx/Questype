'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Compass,
  LockKeyhole,
  UserRound,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SiteHeader } from './chrome';
import { requestJson, type SessionView } from '@/lib/client-api';
import { useLocale } from '../i18n-provider';

export function Onboarding() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const router = useRouter(),
    search = useSearchParams();
  const [gender, setGender] = useState<'man' | 'woman' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<SessionView | null>(null);
  const requestId = useRef('');
  useEffect(() => {
    requestId.current = crypto.randomUUID();
    requestJson<SessionView>('/api/session')
      .then(setExisting)
      .catch(() => {});
  }, []);
  async function start(event: React.FormEvent) {
    event.preventDefault();
    if (!gender) {
      setError(es ? 'Elige cómo quieres que se represente a tu personaje.' : 'Choose how you would like your character represented.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestJson('/api/session', 'POST', {
        character_gender: gender,
        request_id: requestId.current,
        restart: search.get('new') === '1',
      });
      router.push('/journey');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <div className="flow-page">
      <SiteHeader compact />
      <main id="main" className="onboarding-layout">
        <aside className="onboarding-art">
          <img
            src="/images/forest-waystation.webp"
            alt={es ? 'Un sendero tranquilo a través de un bosque antiguo' : 'A quiet path through an ancient forest'}
          />
          <div className="art-caption">
            <span className="eyebrow">{es ? 'EL PRIMER PASO ES TUYO' : 'THE FIRST STEP IS YOURS'}</span>
            <h2>
              {es ? 'El camino no conoce' : 'The road knows'}
              <br />
              {es ? 'desconocidos.' : 'no strangers.'}
              <br />
              <em>{es ? 'Solo historias aún no contadas.' : 'Only stories yet untold.'}</em>
            </h2>
            <span className="art-coordinate">VEY R · {es ? 'LA ANTIGUA ESTACIÓN' : 'THE OLD WAYSTATION'}</span>
          </div>
        </aside>
        <section className="onboarding-panel">
          <div className="flow-steps">
            <span className="current">01 · {es ? 'Tu personaje' : 'Your character'}</span>
            <i />
            <span>02 · {es ? 'Tu viaje' : 'Your journey'}</span>
            <i />
            <span>03 · {es ? 'Tu revelación' : 'Your reveal'}</span>
          </div>
          <Compass className="panel-symbol" size={35} strokeWidth={1} />
          <span className="eyebrow">{es ? 'ANTES DE CRUZAR EL UMBRAL' : 'BEFORE YOU CROSS THE THRESHOLD'}</span>
          <h1>
            {es ? 'Toda historia comienza' : 'Every story begins'}
            <br />
            {es ? 'con ' : 'with '}<em>{es ? 'alguien.' : 'someone.'}</em>
          </h1>
          <p className="panel-intro">
            {es ? 'Elige cómo aparece tu viajero en la historia.' : 'Choose how your traveler appears in the story.'}
            <br />
            {es ? 'El resto lo revelarán tus elecciones.' : 'The rest, your choices will reveal.'}
          </p>
          {existing &&
          existing.status !== 'completed' &&
          search.get('new') !== '1' ? (
            <div className="resume-box">
              <h3>{es ? 'Tu camino todavía te espera.' : 'Your road is still waiting.'}</h3>
              <p>
                {es ? `Completaste ${existing.completed_scenes} de 15 momentos. Continúa desde donde lo dejaste.` : `You’ve completed ${existing.completed_scenes} of 15 moments. Pick up where you left off.`}
              </p>
              <Link href="/journey" className="button button-gold">
                {es ? 'Continuar tu viaje' : 'Continue your journey'} <ArrowRight size={17} />
              </Link>
              <Link href="/start?new=1" className="text-link">
                {es ? 'Comenzar una nueva historia' : 'Start a new story instead'}
              </Link>
            </div>
          ) : (
            <form onSubmit={start} className="onboarding-form">
              <fieldset>
                <legend>{es ? '¿Cómo quieres que se represente a tu personaje?' : 'How would you like your character represented?'}</legend>
                <RadioGroup
                  value={gender ?? ''}
                  onValueChange={(value) => setGender(value as 'man' | 'woman')}
                  className="representation-options"
                  aria-label={es ? 'Representación del personaje' : 'Character representation'}
                >
                  {(['man', 'woman'] as const).map((value) => (
                    <label
                      key={value}
                      className={`representation-card ${gender === value ? 'selected' : ''}`}
                    >
                      <div className="representation-symbol">
                        <UserRound size={31} strokeWidth={1} />
                      </div>
                      <span className="representation-name">
                        {value === 'man' ? (es ? 'Hombre' : 'Man') : (es ? 'Mujer' : 'Woman')}
                        <small>
                          {value === 'man' ? (es ? 'Él' : 'He / him') : (es ? 'Ella' : 'She / her')}
                        </small>
                      </span>
                      <RadioGroupItem
                        value={value}
                        aria-label={value === 'man' ? (es ? 'Hombre' : 'Man') : (es ? 'Mujer' : 'Woman')}
                      />
                      {gender === value && (
                        <Check size={14} className="representation-check" />
                      )}
                    </label>
                  ))}
                </RadioGroup>
                <p className="field-hint">
                  {es ? 'Esto define la representación de tu personaje. Tus elecciones revelan tus arquetipos.' : 'This shapes your character’s representation. Your choices shape your archetypes.'}
                </p>
              </fieldset>
              {error && (
                <p role="alert" className="error-message">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="button button-gold full-width"
                type="submit"
              >
                {busy ? (es ? 'Abriendo tu historia…' : 'Opening your story…') : (es ? 'Entrar en la historia' : 'Step into the story')}
                <ArrowRight size={18} />
              </button>
              <p className="private-note">
                <LockKeyhole size={13} />
                {es ? 'Tu viaje es privado. No necesitas una cuenta.' : 'Your journey is private. No account needed.'}
              </p>
            </form>
          )}
          <p className="onboarding-disclaimer">
            {es ? 'Un viaje para la reflexión personal y el entretenimiento.' : 'A journey for self-reflection and entertainment.'}
            <br />
            {es ? 'Esta experiencia no ofrece diagnósticos psicológicos ni médicos.' : 'This experience does not provide psychological or medical diagnosis.'}
          </p>
        </section>
      </main>
    </div>
  );
}
