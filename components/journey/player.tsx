'use client';
import { useEffect, useState } from 'react';
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
import {
  requestJson,
  type SessionView,
  type PublicScene,
} from '@/lib/client-api';
import { useLocale } from '../i18n-provider';

function sceneImage(
  scene: PublicScene,
  gender: SessionView['character_gender'],
  selectedChoice: string,
  savedVariant: number | null,
) {
  const prefix = gender === 'man' ? 'man' : 'woman';
  const selectedVariant = scene.choices.findIndex(
    (option) => option.id === selectedChoice,
  );

  if (scene.order === 10 && selectedVariant >= 0) {
    return `/images/journey/${prefix}-10-${selectedVariant + 1}.webp`;
  }
  if (scene.order === 11) {
    return `/images/journey/${prefix}-10-${savedVariant ?? 1}.webp`;
  }
  if (scene.order === 5) {
    return `/images/journey/${prefix}-05-mara.webp`;
  }

  // The original collection was numbered before moment five was added, so the
  // remaining files keep their existing one-position offset.
  const visualMoment = scene.order <= 4 ? scene.order : scene.order - 1;
  return `/images/journey/${prefix}-${String(visualMoment).padStart(2, '0')}.webp`;
}

export function JourneyPlayer() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const actNames = es ? ['La llamada', 'El umbral', 'Aliados y desconocidos', 'Las pruebas', 'La ofrenda', 'El faro', 'El regreso'] : ['The Call', 'The Threshold', 'Allies & Strangers', 'The Trials', 'The Offering', 'The Lighthouse', 'The Return'];
  const router = useRouter();
  const [session, setSession] = useState<SessionView | null>(null);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pause, setPause] = useState(false);
  const [map, setMap] = useState(false);
  function accept(view: SessionView) {
    setSession(view);
    setChoice('');
    if (view.result_id) router.replace(`/result/${view.result_id}`);
    else if (view.status === 'processing') router.replace('/processing');
  }
  async function load() {
    setError('');
    try {
      accept(await requestJson<SessionView>('/api/session'));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, [locale]);
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
  const imageSource =
    scene && session
      ? sceneImage(
          scene,
          session.character_gender,
          choice,
          session.scene_image_variant,
        )
      : '';
  return (
    <div className="player-page">
      <header className="player-header page-width">
        <Brand />
        <span className="player-journey-label">
          {es ? 'VIAJE I' : 'JOURNEY I'} <i /> {es ? 'EL CAMINO NO ESCRITO' : 'THE UNWRITTEN ROAD'}
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
              key={imageSource}
              src={imageSource}
              alt={es ? `Ilustración de ${scene.title}` : `Illustration for ${scene.title}`}
            />
            <div className="scene-art-top">
              <span>
                {es ? 'ACTO' : 'ACT'} {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][scene.act - 1]}
              </span>
              <span>{actNames[scene.act - 1]}</span>
            </div>
            <div className="scene-art-bottom">
              <Compass size={30} strokeWidth={1} />
              <h2>{actNames[scene.act - 1]}</h2>
              <p>{es ? 'Cada camino revela una posibilidad.' : 'Every path reveals a possibility.'}</p>
              <button className="text-link" onClick={() => setMap(true)}>
                <Map size={15} />
                {es ? 'Ver tu camino' : 'View your path'}
              </button>
            </div>
          </aside>
          <section className="scene-panel">
            <div className="scene-progress-label">
              <span>
                {es ? 'MOMENTO' : 'MOMENT'} {String(scene.order).padStart(2, '0')}{' '}
                <span className="muted">/ 15</span>
              </span>
              <span>
                {Math.round((session.completed_scenes / 15) * 100)}% {es ? 'del camino recorrido' : 'of the road traveled'}
              </span>
            </div>
            <Progress
              value={(session.completed_scenes / 15) * 100}
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
                <legend>{es ? '¿Cuál sientes que es tu siguiente paso?' : 'What feels like your next step?'}</legend>
                <RadioGroup
                  value={choice}
                  onValueChange={(v) => setChoice(String(v))}
                  aria-label={es ? 'Elige tu siguiente paso' : 'Choose your next step'}
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
                  {es ? 'Actualizar tu historia guardada' : 'Refresh your saved story'}
                </button>
              </div>
            )}
            <div className="scene-controls">
              <span>
                <Check size={13} />
                {es ? 'Tu progreso se guarda con cada elección' : 'Your progress saves with every choice'}
              </span>
              <button
                className="button button-gold"
                onClick={next}
                disabled={!choice || busy}
              >
                {busy
                  ? (es ? 'Guardando tu elección…' : 'Saving your choice…')
                  : scene.order === 15
                    ? (es ? 'Revelar mis arquetipos' : 'Reveal my archetypes')
                    : (es ? 'Continuar el viaje' : 'Continue the journey')}
                <ArrowRight size={17} />
              </button>
            </div>
            <p className="scene-reassurance">
              {es ? 'El camino continúa. Tu respuesta revela cómo lo enfrentas.' : 'The road continues. Your response reveals how you meet it.'}
            </p>
          </section>
        </main>
      ) : (
        <main id="main" className="centered-state">
          <Compass size={42} strokeWidth={1} />
          <h1>{error ? (es ? 'Tu camino te espera.' : 'Your path awaits.') : (es ? 'Encontrando tu lugar…' : 'Finding your place…')}</h1>
          {error && (
            <>
              <p role="alert">{error}</p>
              <Link href="/start" className="button button-gold">
                {es ? 'Comenzar un viaje' : 'Begin a journey'} <ArrowRight size={16} />
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
            {es ? 'Tus elecciones completadas se guardan automáticamente. Regresa desde este navegador para continuar desde este momento.' : 'Your completed choices are saved automatically. Return on this browser to continue from this moment.'}
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
            {es ? 'El camino que estás recorriendo' : 'The path you’re traveling'}
          </DialogTitle>
          <DialogDescription>
            {es ? 'Siete capítulos. Quince momentos. Una historia que se revela una elección a la vez.' : 'Seven chapters. Fifteen moments. A story that unfolds one choice at a time.'}
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
                      ? (es ? 'Estás aquí' : 'You are here')
                      : (scene?.act ?? 1) > i + 1
                        ? (es ? 'Capítulo completado' : 'Chapter completed')
                        : (es ? 'Más adelante' : 'Still ahead')}
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
