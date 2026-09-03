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
import { Brand } from './chrome';
import {
  requestJson,
  actNames,
  actImages,
  type SessionView,
} from '@/lib/client-api';

export function JourneyPlayer() {
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
  }, []);
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
  return (
    <div className="player-page">
      <header className="player-header page-width">
        <Brand />
        <span className="player-journey-label">
          JOURNEY I <i /> THE UNWRITTEN ROAD
        </span>
        <button className="quiet-button" onClick={() => setPause(true)}>
          <Pause size={15} />
          Save & pause
        </button>
      </header>
      {scene ? (
        <main id="main" className="player-layout" key={scene.id}>
          <aside className="scene-art">
            <img
              src={`/images/${actImages[scene.act - 1]}.png`}
              alt={`The landscape of ${actNames[scene.act - 1]}`}
            />
            <div className="scene-art-top">
              <span>
                ACT {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][scene.act - 1]}
              </span>
              <span>{actNames[scene.act - 1]}</span>
            </div>
            <div className="scene-art-bottom">
              <Compass size={30} strokeWidth={1} />
              <h2>{actNames[scene.act - 1]}</h2>
              <p>Every path reveals a possibility.</p>
              <button className="text-link" onClick={() => setMap(true)}>
                <Map size={15} />
                View your path
              </button>
            </div>
          </aside>
          <section className="scene-panel">
            <div className="scene-progress-label">
              <span>
                MOMENT {String(scene.order).padStart(2, '0')}{' '}
                <span className="muted">/ 15</span>
              </span>
              <span>
                {Math.round((session.completed_scenes / 15) * 100)}% of the road
                traveled
              </span>
            </div>
            <Progress
              value={(session.completed_scenes / 15) * 100}
              aria-label="Journey progress"
              className="journey-progress"
            />
            <div className="scene-story">
              <span className="eyebrow">{actNames[scene.act - 1]}</span>
              <h1>{scene.title}</h1>
              <p>{scene.narrative}</p>
            </div>
            <fieldset className="scene-decisions">
              <legend>What feels like your next step?</legend>
              <RadioGroup
                value={choice}
                onValueChange={(v) => setChoice(String(v))}
                aria-label="Choose your next step"
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
            {error && (
              <div role="alert" className="error-message">
                {error}
                <button className="text-link" onClick={load}>
                  <RotateCw size={14} />
                  Refresh your saved story
                </button>
              </div>
            )}
            <div className="scene-controls">
              <span>
                <Check size={13} />
                Your progress saves with every choice
              </span>
              <button
                className="button button-gold"
                onClick={next}
                disabled={!choice || busy}
              >
                {busy
                  ? 'Saving your choice…'
                  : scene.order === 15
                    ? 'Reveal my archetypes'
                    : 'Continue the journey'}
                <ArrowRight size={17} />
              </button>
            </div>
            <p className="scene-reassurance">
              There is no right path. Only the one you choose.
            </p>
          </section>
        </main>
      ) : (
        <main id="main" className="centered-state">
          <Compass size={42} strokeWidth={1} />
          <h1>{error ? 'Your path awaits.' : 'Finding your place…'}</h1>
          {error && (
            <>
              <p role="alert">{error}</p>
              <Link href="/start" className="button button-gold">
                Begin a journey <ArrowRight size={16} />
              </Link>
            </>
          )}
        </main>
      )}
      <Dialog open={pause} onOpenChange={setPause}>
        <DialogContent className="story-dialog">
          <Compass size={30} strokeWidth={1} />
          <DialogTitle className="dialog-heading">
            The road will be here.
          </DialogTitle>
          <DialogDescription>
            Your completed choices are saved automatically. Return on this
            browser to continue from this moment.
          </DialogDescription>
          <div className="dialog-actions">
            <Link href="/" className="button button-gold">
              Return to the world
            </Link>
            <button
              className="button button-outline"
              onClick={() => setPause(false)}
            >
              Keep going
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={map} onOpenChange={setMap}>
        <DialogContent className="story-dialog">
          <DialogTitle className="dialog-heading">
            The path you’re traveling
          </DialogTitle>
          <DialogDescription>
            Seven chapters. Fifteen moments. A story that unfolds one choice at
            a time.
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
                      ? 'You are here'
                      : (scene?.act ?? 1) > i + 1
                        ? 'Chapter completed'
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
