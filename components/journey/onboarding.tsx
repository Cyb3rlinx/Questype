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

export function Onboarding() {
  const router = useRouter(),
    search = useSearchParams();
  const [name, setName] = useState('');
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
      setError('Choose how you would like your character represented.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestJson('/api/session', 'POST', {
        name,
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
            alt="A quiet path through an ancient forest"
          />
          <div className="art-caption">
            <span className="eyebrow">THE FIRST STEP IS YOURS</span>
            <h2>
              The road knows
              <br />
              no strangers.
              <br />
              <em>Only stories yet untold.</em>
            </h2>
            <span className="art-coordinate">VEY R · THE OLD WAYSTATION</span>
          </div>
        </aside>
        <section className="onboarding-panel">
          <div className="flow-steps">
            <span className="current">01 · Your character</span>
            <i />
            <span>02 · Your journey</span>
            <i />
            <span>03 · Your reveal</span>
          </div>
          <Compass className="panel-symbol" size={35} strokeWidth={1} />
          <span className="eyebrow">BEFORE YOU CROSS THE THRESHOLD</span>
          <h1>
            Every story begins
            <br />
            with <em>someone.</em>
          </h1>
          <p className="panel-intro">
            Tell us a little about your traveler.
            <br />
            The rest, your choices will reveal.
          </p>
          {existing &&
          existing.status !== 'completed' &&
          search.get('new') !== '1' ? (
            <div className="resume-box">
              <h3>Your road is still waiting.</h3>
              <p>
                You’ve completed {existing.completed_scenes} of 15 moments. Pick
                up where you left off.
              </p>
              <Link href="/journey" className="button button-gold">
                Continue your journey <ArrowRight size={17} />
              </Link>
              <Link href="/start?new=1" className="text-link">
                Start a new story instead
              </Link>
            </div>
          ) : (
            <form onSubmit={start} className="onboarding-form">
              <label htmlFor="traveler-name">
                What should we call you? <span>Optional</span>
              </label>
              <input
                id="traveler-name"
                autoComplete="given-name"
                placeholder="Your name, traveler"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <fieldset>
                <legend>How would you like your character represented?</legend>
                <RadioGroup
                  value={gender ?? ''}
                  onValueChange={(value) => setGender(value as 'man' | 'woman')}
                  className="representation-options"
                  aria-label="Character representation"
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
                        {value === 'man' ? 'Man' : 'Woman'}
                        <small>
                          {value === 'man' ? 'He / him' : 'She / her'}
                        </small>
                      </span>
                      <RadioGroupItem
                        value={value}
                        aria-label={value === 'man' ? 'Man' : 'Woman'}
                      />
                      {gender === value && (
                        <Check size={14} className="representation-check" />
                      )}
                    </label>
                  ))}
                </RadioGroup>
                <p className="field-hint">
                  This shapes your character’s representation. Your choices
                  shape your archetypes.
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
                {busy ? 'Opening your story…' : 'Step into the story'}
                <ArrowRight size={18} />
              </button>
              <p className="private-note">
                <LockKeyhole size={13} />
                Your journey is private. No account needed.
              </p>
            </form>
          )}
          <p className="onboarding-disclaimer">
            A journey for self-reflection and entertainment.
            <br />
            This experience does not provide psychological or medical diagnosis.
          </p>
        </section>
      </main>
    </div>
  );
}
