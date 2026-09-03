'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  Download,
  Share2,
  Sparkles,
  Leaf,
  Heart,
  Sun,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { SiteHeader, SiteFooter } from './chrome';
import { SharePanel } from './share-panel';
import { requestJson } from '@/lib/client-api';
import type { StructuredProfile } from '@/src/domain/scoring/profile';
import type { Interpretation } from '@/src/ai/contracts';
import type { ReportData } from '@/src/reports/data';
export interface ResultPayload {
  profile: StructuredProfile;
  interpretation: Interpretation;
  interpretation_provider: string;
}
const labels: Record<string, string> = {
  power: 'Influence',
  freedom: 'Freedom',
  connection: 'Connection',
  creation: 'Creation',
  knowledge: 'Knowledge',
  protection: 'Protection',
  impulsive: 'Immediate action',
  strategic: 'Strategic thinking',
  intuitive: 'Intuition',
  rational: 'Analysis',
  protective: 'Protection',
  dominant: 'Direction',
  control: 'Tightening control',
  avoidance: 'Stepping away',
  self_sacrifice: 'Carrying too much',
  rebellion: 'Reflexive resistance',
  obsession: 'Holding too tightly',
  emotional_detachment: 'Emotional distance',
};
function MeterList({ values }: { values: Record<string, number> }) {
  return (
    <div className="meter-list">
      {Object.entries(values)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => (
          <div className="meter-row" key={key}>
            <div>
              <span>{labels[key] ?? key.replaceAll('_', ' ')}</span>
              <span>
                {value}
                <small>/100</small>
              </span>
            </div>
            <div className="meter-track">
              <span style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
    </div>
  );
}
export function ResultView({ resultId }: { resultId: string }) {
  const [data, setData] = useState<ResultPayload | null>(null);
  const [error, setError] = useState('');
  const [share, setShare] = useState(false);
  const [info, setInfo] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    requestJson<ResultPayload>(`/api/results/${resultId}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [resultId]);
  async function download() {
    setExporting(true);
    setMessage('');
    try {
      const report = await requestJson<ReportData>(
        `/api/results/${resultId}/report`,
      );
      const { downloadReport } = await import('@/lib/export-assets');
      await downloadReport(report);
      setMessage('Your personal report is ready.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setExporting(false);
    }
  }
  if (!data)
    return (
      <>
        <SiteHeader compact />
        <main id="main" className="centered-state">
          <Compass size={42} strokeWidth={1} />
          <h1>
            {error ? 'A private story.' : 'Your story is coming into view…'}
          </h1>
          {error && (
            <>
              <p role="alert">{error}</p>
              <Link href="/start" className="button button-gold">
                Begin your own journey <ArrowRight size={17} />
              </Link>
            </>
          )}
        </main>
      </>
    );
  const { profile: p, interpretation: i } = data;
  const primary = p.registry_snapshot.find(
    (a) => a.slug === p.archetypes.primary.slug,
  )!;
  const secondary = p.registry_snapshot.find(
    (a) => a.slug === p.archetypes.secondary.slug,
  )!;
  return (
    <>
      <SiteHeader />
      <main id="main" className="result-page">
        <section className="result-hero page-width">
          <div className="result-identity">
            <span className="eyebrow">
              <Check size={13} /> YOUR JOURNEY, REVEALED
            </span>
            <p className="traveler-greeting">
              {p.user.name
                ? `${p.user.name}, your choices tell a story.`
                : 'Traveler, your choices tell a story.'}
            </p>
            <h1>
              {p.character.title.split(' ').slice(0, -1).join(' ')}
              <br />
              <em>{p.character.title.split(' ').at(-1)}</em>
            </h1>
            <p className="result-lede">
              Your path most strongly aligns with{' '}
              <strong>the {primary.name}</strong>, with the {secondary.name}{' '}
              close at its side.
            </p>
            <div className="identity-tags">
              <span>
                <Compass size={14} />
                {primary.core_desire}
              </span>
            </div>
            <div className="result-actions">
              <button
                className="button button-gold"
                onClick={() => setShare(true)}
              >
                <Share2 size={16} />
                Share your story
              </button>
              <button
                className="button button-outline"
                disabled={exporting}
                onClick={download}
              >
                <Download size={16} />
                {exporting ? 'Preparing report…' : 'Your personal report'}
              </button>
            </div>
            <p aria-live="polite" className="export-message">
              {message}
            </p>
            <span className="completed-label">
              15 choices · A story entirely your own
            </span>
          </div>
          <div className="identity-card">
            <img
              src="/images/valley-reference.webp"
              alt="A traveler at the beginning of a vast, open world"
            />
            <div className="identity-card-top">
              <Compass size={23} strokeWidth={1} />
              <span>THE UNWRITTEN ROAD</span>
            </div>
            <div className="identity-card-bottom">
              <span className="eyebrow">YOUR DOMINANT ARCHETYPE</span>
              <h2>The {primary.name}</h2>
              <div>
                <span>
                  {p.archetypes.primary.normalized_percentage}
                  <small>%</small>
                </span>
                <p>
                  of your archetype
                  <br />
                  alignment
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="result-details page-width">
          <Tabs defaultValue="archetypes" className="result-tabs">
            <TabsList variant="line" className="result-tab-list">
              <TabsTrigger value="archetypes">Your archetypes</TabsTrigger>
              <TabsTrigger value="compass">Your inner compass</TabsTrigger>
              <TabsTrigger value="growth">Connections & growth</TabsTrigger>
            </TabsList>
            <TabsContent value="archetypes">
              <div className="result-columns">
                <article className="result-summary">
                  <span className="eyebrow">
                    THE THREAD THAT RUNS THROUGH YOU
                  </span>
                  <h2>
                    A natural instinct
                    <br />
                    to{' '}
                    <em>
                      {p.character.dominant_motivation === 'knowledge'
                        ? 'understand.'
                        : p.character.dominant_motivation === 'freedom'
                          ? 'explore.'
                          : p.character.dominant_motivation === 'creation'
                            ? 'create.'
                            : p.character.dominant_motivation === 'connection'
                              ? 'connect.'
                              : p.character.dominant_motivation === 'power'
                                ? 'shape what comes next.'
                                : 'care.'}
                    </em>
                  </h2>
                  <p>{i.summary}</p>
                  <div className="result-quote">
                    <span>“</span>
                    <p>{i.social.quote}</p>
                  </div>
                </article>
                <article className="distribution-panel">
                  <div className="panel-title">
                    <h3>Your archetype constellation</h3>
                    <button
                      onClick={() => setInfo(true)}
                      aria-label="About archetype percentages"
                    >
                      <Info size={17} />
                    </button>
                  </div>
                  <p>Many influences. One individual blend.</p>
                  <div className="archetype-bars">
                    {p.archetypes.all.map((a, index) => (
                      <div
                        className={`archetype-bar ${index < 3 ? 'dominant' : ''}`}
                        key={a.slug}
                      >
                        <div>
                          <span>
                            <small>{String(index + 1).padStart(2, '0')}</small>
                            {a.name}
                            {index === 0 && <i>Primary</i>}
                          </span>
                          <strong>{a.normalized_percentage}%</strong>
                        </div>
                        <div className="meter-track">
                          <span
                            style={{ width: `${a.normalized_percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="distribution-note">
                    A blend of narrative patterns, with room to change.
                  </p>
                </article>
              </div>
              <section className="result-strengths">
                <span className="eyebrow">WHAT YOU BRING TO THE ROAD</span>
                <h2>
                  Your natural <em>strengths.</em>
                </h2>
                <div className="strength-grid">
                  {primary.strengths.map((strength, index) => {
                    const Icon = [Sun, Compass, Leaf, Sparkles][index % 4];
                    return (
                      <article key={strength}>
                        <Icon size={24} strokeWidth={1.2} />
                        <h3>
                          {
                            [
                              'A clear sense of possibility',
                              'A way through uncertainty',
                              'A contribution that matters',
                              'Room for another perspective',
                            ][index]
                          }
                        </h3>
                        <p>{strength}.</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            </TabsContent>
            <TabsContent value="compass">
              <div className="compass-grid">
                <article className="insight-panel">
                  <span className="eyebrow">WHAT MOVES YOU</span>
                  <h2>Your motivations</h2>
                  <p>{i.motivation_analysis}</p>
                  <MeterList values={p.motivations} />
                </article>
                <article className="insight-panel">
                  <span className="eyebrow">HOW YOU FIND A WAY</span>
                  <h2>Your decision style</h2>
                  <p>{i.decision_style}</p>
                  <MeterList values={p.decision_style} />
                </article>
              </div>
              <section className="shadow-panel">
                <div>
                  <span className="eyebrow">WHEN THE ROAD GETS DIFFICULT</span>
                  <h2>
                    A meeting with
                    <br />
                    <em>your shadow.</em>
                  </h2>
                  <span className="shadow-tag">
                    {p.archetypes.shadow.slug.charAt(0).toUpperCase() +
                      p.archetypes.shadow.slug.slice(1)}{' '}
                    ·{' '}
                    {p.archetypes.shadow.evidence === 'supported'
                      ? 'Repeated pressure pattern'
                      : 'Tentative reflection'}
                  </span>
                </div>
                <div>
                  <p>{i.shadow_analysis}</p>
                  <div className="watch-list">
                    {primary.shadow_traits.map((t) => (
                      <p key={t}>
                        <span>↳</span>
                        {t}.
                      </p>
                    ))}
                  </div>
                  <p className="small-note">
                    These patterns describe possible responses under pressure.
                    They are not diagnoses.
                  </p>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="growth">
              <div className="growth-columns">
                <article className="insight-panel">
                  <Heart size={26} strokeWidth={1.2} />
                  <span className="eyebrow">THE PEOPLE ALONG YOUR PATH</span>
                  <h2>
                    How you <em>connect.</em>
                  </h2>
                  <p>{i.relationships}</p>
                  <h3>A place to feel at home</h3>
                  <p>{i.ideal_environment}</p>
                </article>
                <article className="growth-panel">
                  <span className="eyebrow">WHAT COMES NEXT</span>
                  <h2>
                    Small steps.
                    <br />
                    <em>New possibilities.</em>
                  </h2>
                  {i.growth_path.map((step, index) => (
                    <div className="growth-step" key={step.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>
                          {
                            [
                              'Make room for a different response',
                              'Practice one small change',
                              'Carry it into everyday life',
                            ][index]
                          }
                        </h3>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </article>
              </div>
              <div className="reflection-panel">
                <Compass size={29} strokeWidth={1} />
                <span className="eyebrow">A QUESTION TO CARRY WITH YOU</span>
                <h2>{i.final_reflection}</h2>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        <section className="result-closing page-width">
          <div>
            <span className="eyebrow">THE STORY DOESN’T END HERE</span>
            <h2>
              Take a little of it <em>with you.</em>
            </h2>
          </div>
          <div>
            <button
              className="button button-gold"
              onClick={() => setShare(true)}
            >
              Share your story <ArrowUpRight size={17} />
            </button>
            <Link href="/start?new=1" className="text-link">
              <RotateCcw size={14} />
              Walk a different path
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <SharePanel open={share} onOpenChange={setShare} result={data} />
      <Dialog open={info} onOpenChange={setInfo}>
        <DialogContent className="story-dialog">
          <DialogTitle className="dialog-heading">
            A pattern, not a prediction.
          </DialogTitle>
          <DialogDescription>
            These percentages show the relative alignment of your story choices
            with twelve archetypes. They add up to 100%. They are not
            probabilities, population rankings or clinical findings. Motivation
            and decision indices are independent scales from 0 to 100.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
