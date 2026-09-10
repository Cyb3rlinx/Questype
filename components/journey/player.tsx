'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Compass, Map, Pause, RotateCw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brand, LanguageSwitch } from './chrome';
import { requestJson, type SessionView } from '@/lib/client-api';
import { useLocale } from '../i18n-provider';
import { SoundtrackControl } from './soundtrack';

function romanNumeral(value: number) {
  const numerals: readonly [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = value;
  let result = '';
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

export function JourneyPlayer({ journeySlug }: { journeySlug: string }) {
  const { locale } = useLocale();
  const es = locale === 'es';
  const router = useRouter();
  const [session, setSession] = useState<SessionView | null>(null);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pause, setPause] = useState(false);
  const [map, setMap] = useState(false);
  const sessionUrl = `/api/session?journey_slug=${encodeURIComponent(journeySlug)}`;
  const accept = useCallback(
    (view: SessionView) => {
      setSession(view);
      setChoice('');
      if (view.result_id) router.replace(`/result/${view.result_id}`);
      else if (view.status === 'processing')
        router.replace(`/journey/${view.journey.slug}/processing`);
    },
    [router],
  );
  const load = useCallback(async () => {
    setError('');
    try {
      accept(await requestJson<SessionView>(sessionUrl));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [accept, sessionUrl]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load, locale]);
  async function next() {
    if (!session?.scene || !choice) return;
    setBusy(true);
    setError('');
    try {
      accept(
        await requestJson<SessionView>('/api/session/answer', 'POST', {
          session_id: session.id,
          scene_id: session.scene.id,
          choice_id: choice,
        }),
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const scene = session?.scene;
  const visual = scene
    ? (choice && scene.visual.choice_variants[choice]) || scene.visual.default
    : null;
  const actNames = session?.journey.act_names ?? [];
  return (
    <div className="player-page">
      <header className="player-header page-width">
        <Brand />
        <span className="player-journey-label">
          {es ? 'VIAJE' : 'JOURNEY'} <i />{' '}
          {session?.journey.title.toUpperCase() ?? ''}
        </span>
        <LanguageSwitch />
        <button className="quiet-button" onClick={() => setPause(true)}>
          <Pause size={15} />
          {es ? 'Guardar y pausar' : 'Save & pause'}
        </button>
      </header>
      {scene ? (
        <main id="main" className="player-layout" key={scene.id}>
          <aside className="scene-art">
            <img
              key={visual?.src}
              src={visual?.src}
              srcSet={
                visual?.responsive_src
                  ? `${visual.responsive_src} 900w, ${visual.src} ${visual.width}w`
                  : undefined
              }
              sizes="100vw"
              width={visual?.width}
              height={visual?.height}
              fetchPriority="high"
              alt={visual?.alt ?? ''}
              style={
                visual
                  ? {
                      objectPosition: `${visual.focal_point.x * 100}% ${visual.focal_point.y * 100}%`,
                    }
                  : undefined
              }
            />
            <SoundtrackControl />
            <div className="scene-art-top">
              <span>
                {es ? 'ACTO' : 'ACT'} {romanNumeral(scene.act)}
              </span>
              <span>{actNames[scene.act - 1]}</span>
            </div>
            <div className="scene-art-bottom">
              <Compass size={30} strokeWidth={1} />
              <h2>{actNames[scene.act - 1]}</h2>
              <p>
                {es
                  ? 'Cada camino revela una posibilidad.'
                  : 'Every path reveals a possibility.'}
              </p>
              <button className="text-link" onClick={() => setMap(true)}>
                <Map size={15} />
                {es ? 'Ver tu camino' : 'View your path'}
              </button>
            </div>
          </aside>
          <section className="scene-panel">
            <div className="scene-progress-label">
              <span>
                {es ? 'MOMENTO' : 'MOMENT'}{' '}
                {String(scene.order).padStart(2, '0')}{' '}
                <span className="muted">/ {session.total_scenes}</span>
              </span>
              <span>
                {Math.round(
                  (session.completed_scenes / session.total_scenes) * 100,
                )}
                % {es ? 'del camino recorrido' : 'of the road traveled'}
              </span>
            </div>
            <Progress
              value={(session.completed_scenes / session.total_scenes) * 100}
              aria-label={es ? 'Progreso del viaje' : 'Journey progress'}
              className="journey-progress"
            />
            <div className="scene-content-grid">
              <div className="scene-story">
                <div className="scene-heading">
                  <span className="eyebrow">{actNames[scene.act - 1]}</span>
                  <h1>{scene.title}</h1>
                </div>
                <p>{scene.narrative}</p>
              </div>
              <fieldset className="scene-decisions">
                <legend>
                  {es
                    ? '¿Cuál sientes que es tu siguiente paso?'
                    : 'What feels like your next step?'}
                </legend>
                <RadioGroup
                  value={choice}
                  onValueChange={(v) => setChoice(String(v))}
                  aria-label={
                    es ? 'Elige tu siguiente paso' : 'Choose your next step'
                  }
                  disabled={busy}
                  className="decision-list"
                >
                  {scene.choices.map((option, i) => (
                    <label
                      className={`decision-option ${choice === option.id ? 'selected' : ''}`}
                      key={option.id}
                    >
                      <span className="choice-letter">{'ABCD'[i]}</span>
                      <span className="choice-copy">{option.text}</span>
                      <RadioGroupItem
                        value={option.id}
                        className="choice-radio"
                        aria-label={option.text}
                      />
                    </label>
                  ))}
                </RadioGroup>
              </fieldset>
            </div>
            {error && (
              <div role="alert" className="error-message">
                {error}
                <button className="text-link" onClick={load}>
                  <RotateCw size={14} />
                  {es
                    ? 'Actualizar tu historia guardada'
                    : 'Refresh your saved story'}
                </button>
              </div>
            )}
            <div className="scene-controls">
              <span>
                <Check size={13} />
                {es
                  ? 'Tu progreso se guarda con cada elección'
                  : 'Your progress saves with every choice'}
              </span>
              <button
                className="button button-gold"
                onClick={next}
                disabled={!choice || busy}
              >
                {busy
                  ? es
                    ? 'Guardando tu elección…'
                    : 'Saving your choice…'
                  : scene.order === session.total_scenes
                    ? es
                      ? 'Revelar mis arquetipos'
                      : 'Reveal my archetypes'
                    : es
                      ? 'Continuar el viaje'
                      : 'Continue the journey'}
                <ArrowRight size={17} />
              </button>
            </div>
            <p className="scene-reassurance">
              {es
                ? 'El camino continúa. Tu respuesta revela cómo lo enfrentas.'
                : 'The road continues. Your response reveals how you meet it.'}
            </p>
          </section>
        </main>
      ) : (
        <main id="main" className="centered-state">
          <Compass size={42} strokeWidth={1} />
          <h1>
            {error
              ? es
                ? 'Tu camino te espera.'
                : 'Your path awaits.'
              : es
                ? 'Encontrando tu lugar…'
                : 'Finding your place…'}
          </h1>
          {error && (
            <>
              <p role="alert">{error}</p>
              <Link
                href={`/journey/${journeySlug}/start`}
                className="button button-gold"
              >
                {es ? 'Comenzar un viaje' : 'Begin a journey'}{' '}
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </main>
      )}
      <Dialog open={pause} onOpenChange={setPause}>
        <DialogContent className="story-dialog">
          <Compass size={30} strokeWidth={1} />
          <DialogTitle className="dialog-heading">
            {es ? 'El camino seguirá aquí.' : 'The road will be here.'}
          </DialogTitle>
          <DialogDescription>
            {es
              ? 'Tus elecciones completadas se guardan automáticamente. Regresa desde este navegador para continuar desde este momento.'
              : 'Your completed choices are saved automatically. Return on this browser to continue from this moment.'}
          </DialogDescription>
          <div className="dialog-actions">
            <Link href="/" className="button button-gold">
              {es ? 'Volver al mundo' : 'Return to the world'}
            </Link>
            <button
              className="button button-outline"
              onClick={() => setPause(false)}
            >
              {es ? 'Seguir adelante' : 'Keep going'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={map} onOpenChange={setMap}>
        <DialogContent className="story-dialog">
          <DialogTitle className="dialog-heading">
            {es
              ? 'El camino que estás recorriendo'
              : 'The path you’re traveling'}
          </DialogTitle>
          <DialogDescription>
            {es
              ? `${session?.journey.act_count ?? 0} capítulos. ${session?.total_scenes ?? 0} momentos. Una historia que se revela una elección a la vez.`
              : `${session?.journey.act_count ?? 0} chapters. ${session?.total_scenes ?? 0} moments. A story that unfolds one choice at a time.`}
          </DialogDescription>
          <ol className="act-map">
            {actNames.map((name, i) => (
              <li key={name} className={(scene?.act ?? 1) > i ? 'reached' : ''}>
                <span>
                  {(scene?.act ?? 1) > i + 1 ? (
                    <Check size={14} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>
                <div>
                  {name}
                  <small>
                    {(scene?.act ?? 1) === i + 1
                      ? es
                        ? 'Estás aquí'
                        : 'You are here'
                      : (scene?.act ?? 1) > i + 1
                        ? es
                          ? 'Capítulo completado'
                          : 'Chapter completed'
                        : es
                          ? 'Más adelante'
                          : 'Still ahead'}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
