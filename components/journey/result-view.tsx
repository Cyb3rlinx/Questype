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
import { useLocale } from '../i18n-provider';
import { localizeArchetype, localizedCharacterTitle, archetypeName } from '@/src/i18n/archetypes';
import { archetypeResultCopy } from '@/src/i18n/result-copy';
import { archetypeImage, archetypeImageAlt } from '@/src/domain/archetype-images';
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
const labelsEs: Record<string, string> = { power: 'Influencia', freedom: 'Libertad', connection: 'Conexión', creation: 'Creación', knowledge: 'Conocimiento', protection: 'Protección', impulsive: 'Acción inmediata', strategic: 'Pensamiento estratégico', intuitive: 'Intuición', rational: 'Análisis', protective: 'Protección', dominant: 'Dirección', control: 'Mayor control', avoidance: 'Alejamiento', self_sacrifice: 'Cargar demasiado', rebellion: 'Resistencia automática', obsession: 'Aferrarse demasiado', emotional_detachment: 'Distancia emocional' };
function MeterList({ values, es }: { values: Record<string, number>; es: boolean }) {
  return (
    <div className="meter-list">
      {Object.entries(values)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => (
          <div className="meter-row" key={key}>
            <div>
              <span>{(es ? labelsEs : labels)[key] ?? key.replaceAll('_', ' ')}</span>
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
  const { locale } = useLocale();
  const es = locale === 'es';
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
  }, [resultId, locale]);
  async function download() {
    setExporting(true);
    setMessage('');
    try {
      const report = await requestJson<ReportData>(
        `/api/results/${resultId}/report`,
      );
      const { downloadReport } = await import('@/lib/export-assets');
      await downloadReport(report);
      setMessage(es ? 'Tu informe personal está listo.' : 'Your personal report is ready.');
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
            {error ? (es ? 'Una historia privada.' : 'A private story.') : (es ? 'Tu historia está tomando forma…' : 'Your story is coming into view…')}
          </h1>
          {error && (
            <>
              <p role="alert">{error}</p>
              <Link href="/start" className="button button-gold">
                {es ? 'Comienza tu propio viaje' : 'Begin your own journey'} <ArrowRight size={17} />
              </Link>
            </>
          )}
        </main>
      </>
    );
  const { profile: p, interpretation: i } = data;
  const primary = localizeArchetype(p.registry_snapshot.find(
    (a) => a.slug === p.archetypes.primary.slug,
  )!, locale);
  const secondary = localizeArchetype(p.registry_snapshot.find(
    (a) => a.slug === p.archetypes.secondary.slug,
  )!, locale);
  const characterTitle = localizedCharacterTitle(p, locale);
  const primaryImage = archetypeImage(p.archetypes.primary.slug, p.user.character_gender);
  const resultCopy = archetypeResultCopy(p.archetypes.primary.slug, locale);
  return (
    <>
      <SiteHeader />
      <main id="main" className="result-page">
        <section className="result-hero page-width">
          <div className="result-identity">
            <span className="eyebrow">
              <Check size={13} /> {es ? 'TU VIAJE, REVELADO' : 'YOUR JOURNEY, REVEALED'}
            </span>
            <p className="traveler-greeting">
              {es ? 'El camino fue el mismo. La forma en que lo recorriste fue completamente tuya.' : 'Your road was the same. The way you traveled it was entirely yours.'}
            </p>
            <h1>
              {characterTitle.split(' ').slice(0, -1).join(' ')}
              <br />
              <em>{characterTitle.split(' ').at(-1)}</em>
            </h1>
            <p className="result-lede">
              {es ? 'Tu camino se alinea con mayor fuerza con ' : 'Your path most strongly aligns with '}
              <strong>{es ? primary.name : `the ${primary.name}`}</strong>{es ? `, con ${secondary.name} muy cerca.` : `, with the ${secondary.name} close at its side.`}
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
                {es ? 'Comparte tu historia' : 'Share your story'}
              </button>
              <button
                className="button button-outline"
                disabled={exporting}
                onClick={download}
              >
                <Download size={16} />
                {exporting ? (es ? 'Preparando informe…' : 'Preparing report…') : (es ? 'Tu informe personal' : 'Your personal report')}
              </button>
            </div>
            <p aria-live="polite" className="export-message">
              {message}
            </p>
            <span className="completed-label">
              {es ? '15 elecciones · Una historia completamente tuya' : '15 choices · A story entirely your own'}
            </span>
          </div>
          <div className="identity-card">
            <img
              src={primaryImage}
              width={900}
              height={1600}
              alt={archetypeImageAlt(p.archetypes.primary.slug, primary.name, p.user.character_gender, locale)}
              fetchPriority="high"
            />
            <div className="identity-card-top">
              <Compass size={23} strokeWidth={1} />
              <span>{es ? 'EL CAMINO NO ESCRITO' : 'THE UNWRITTEN ROAD'}</span>
            </div>
            <div className="identity-card-bottom">
              <span className="eyebrow">{es ? 'TU ARQUETIPO DOMINANTE' : 'YOUR DOMINANT ARCHETYPE'}</span>
              <h2>{es ? primary.name : `The ${primary.name}`}</h2>
              <div>
                <span>
                  {p.archetypes.primary.normalized_percentage}
                  <small>%</small>
                </span>
                <p>
                  {es ? 'de tu afinidad' : 'of your archetype'}
                  <br />
                  {es ? 'arquetípica' : 'alignment'}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="result-details page-width">
          <Tabs defaultValue="archetypes" className="result-tabs">
            <TabsList variant="line" className="result-tab-list">
              <TabsTrigger value="archetypes">{es ? 'Tus arquetipos' : 'Your archetypes'}</TabsTrigger>
              <TabsTrigger value="compass">{es ? 'Tu brújula interior' : 'Your inner compass'}</TabsTrigger>
              <TabsTrigger value="growth">{es ? 'Vínculos y crecimiento' : 'Connections & growth'}</TabsTrigger>
            </TabsList>
            <TabsContent value="archetypes">
              <div className="result-columns">
                <article className="result-summary">
                  <span className="eyebrow">
                    {es ? 'EL HILO QUE TE RECORRE' : 'THE THREAD THAT RUNS THROUGH YOU'}
                  </span>
                  <h2>
                    {resultCopy.headline}
                    <br />
                    <em>{resultCopy.emphasis}</em>
                  </h2>
                  <p className="archetype-thread-lead">{resultCopy.threadLead}</p>
                  <p>{resultCopy.threadBody}</p>
                  <div className="result-quote">
                    <span>“</span>
                    <p>{resultCopy.quote}</p>
                  </div>
                </article>
                <article className="distribution-panel">
                  <div className="panel-title">
                    <h3>{es ? 'Tu constelación de arquetipos' : 'Your archetype constellation'}</h3>
                    <button
                      onClick={() => setInfo(true)}
                      aria-label={es ? 'Acerca de los porcentajes de arquetipos' : 'About archetype percentages'}
                    >
                      <Info size={17} />
                    </button>
                  </div>
                  <p>{es ? 'Muchas influencias. Una combinación individual.' : 'Many influences. One individual blend.'}</p>
                  <div className="archetype-bars">
                    {p.archetypes.all.map((a, index) => (
                      <div
                        className={`archetype-bar ${index < 2 ? 'dominant' : ''}`}
                        key={a.slug}
                      >
                        <div>
                          <span>
                            <small>{String(index + 1).padStart(2, '0')}</small>
                            {archetypeName(a.slug, a.name, locale)}
                            {index === 0 && <i>{es ? 'Principal' : 'Primary'}</i>}
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
                    {es ? 'Una combinación de patrones narrativos con espacio para cambiar.' : 'A blend of narrative patterns, with room to change.'}
                  </p>
                </article>
              </div>
              <section className="result-strengths">
                <span className="eyebrow">{es ? 'LO QUE APORTAS AL CAMINO' : 'WHAT YOU BRING TO THE ROAD'}</span>
                <h2>
                  {es ? 'Tus fortalezas ' : 'Your natural '}<em>{es ? 'naturales.' : 'strengths.'}</em>
                </h2>
                <div className="strength-grid">
                  {primary.strengths.map((strength, index) => {
                    const Icon = [Sun, Compass, Leaf, Sparkles][index % 4];
                    return (
                      <article key={strength}>
                        <Icon size={24} strokeWidth={1.2} />
                        <h3>
                          {resultCopy.strengthTitles[index]}
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
                  <span className="eyebrow">{es ? 'LO QUE TE MUEVE' : 'WHAT MOVES YOU'}</span>
                  <h2>{es ? 'Tus motivaciones' : 'Your motivations'}</h2>
                  <p>{i.motivation_analysis}</p>
                  <MeterList values={p.motivations} es={es} />
                </article>
                <article className="insight-panel">
                  <span className="eyebrow">{es ? 'CÓMO ENCUENTRAS EL CAMINO' : 'HOW YOU FIND A WAY'}</span>
                  <h2>{es ? 'Tu forma de decidir' : 'Your decision style'}</h2>
                  <p>{i.decision_style}</p>
                  <MeterList values={p.decision_style} es={es} />
                </article>
              </div>
              <section className="shadow-panel">
                <div>
                  <span className="eyebrow">{es ? 'CUANDO EL CAMINO SE VUELVE DIFÍCIL' : 'WHEN THE ROAD GETS DIFFICULT'}</span>
                  <h2>
                    {es ? 'Un encuentro con' : 'A meeting with'}
                    <br />
                    <em>{es ? 'tu sombra.' : 'your shadow.'}</em>
                  </h2>
                  <span className="shadow-tag">
                    {archetypeName(p.archetypes.shadow.slug, p.archetypes.shadow.slug.charAt(0).toUpperCase() + p.archetypes.shadow.slug.slice(1), locale)}{' '}
                    ·{' '}
                    {p.archetypes.shadow.evidence === 'supported'
                      ? (es ? 'Patrón repetido bajo presión' : 'Repeated pressure pattern')
                      : (es ? 'Reflexión tentativa' : 'Tentative reflection')}
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
                    {es ? 'Estos patrones describen posibles respuestas bajo presión. No son diagnósticos.' : 'These patterns describe possible responses under pressure. They are not diagnoses.'}
                  </p>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="growth">
              <div className="growth-columns">
                <article className="insight-panel">
                  <Heart size={26} strokeWidth={1.2} />
                  <span className="eyebrow">{es ? 'LAS PERSONAS EN TU CAMINO' : 'THE PEOPLE ALONG YOUR PATH'}</span>
                  <h2>
                    {es ? 'Cómo ' : 'How you '}<em>{es ? 'conectas.' : 'connect.'}</em>
                  </h2>
                  <p>{i.relationships}</p>
                  <h3>{es ? 'Un lugar para sentirte en casa' : 'A place to feel at home'}</h3>
                  <p>{i.ideal_environment}</p>
                </article>
                <article className="growth-panel">
                  <span className="eyebrow">{es ? 'LO QUE VIENE DESPUÉS' : 'WHAT COMES NEXT'}</span>
                  <h2>
                    {es ? 'Pasos pequeños.' : 'Small steps.'}
                    <br />
                    <em>{es ? 'Nuevas posibilidades.' : 'New possibilities.'}</em>
                  </h2>
                  {i.growth_path.map((step, index) => (
                    <div className="growth-step" key={step.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>
                          {
                            (es ? [
                              'Abre espacio para una respuesta diferente',
                              'Practica un cambio pequeño',
                              'Llévalo a tu vida cotidiana',
                            ] : [
                              'Make room for a different response',
                              'Practice one small change',
                              'Carry it into everyday life',
                            ])[index]
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
                <span className="eyebrow">{es ? 'UNA PREGUNTA PARA LLEVAR CONTIGO' : 'A QUESTION TO CARRY WITH YOU'}</span>
                <h2>{i.final_reflection}</h2>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        <section className="result-closing page-width">
          <div>
            <span className="eyebrow">{es ? 'LA HISTORIA NO TERMINA AQUÍ' : 'THE STORY DOESN’T END HERE'}</span>
            <h2>
              {es ? 'Lleva una parte ' : 'Take a little of it '}<em>{es ? 'contigo.' : 'with you.'}</em>
            </h2>
          </div>
          <div>
            <button
              className="button button-gold"
              onClick={() => setShare(true)}
            >
              {es ? 'Comparte tu historia' : 'Share your story'} <ArrowUpRight size={17} />
            </button>
            <Link href="/start?new=1" className="text-link">
              <RotateCcw size={14} />
              {es ? 'Recorrer un camino diferente' : 'Walk a different path'}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <SharePanel open={share} onOpenChange={setShare} result={data} />
      <Dialog open={info} onOpenChange={setInfo}>
        <DialogContent className="story-dialog">
          <DialogTitle className="dialog-heading">
            {es ? 'Un patrón, no una predicción.' : 'A pattern, not a prediction.'}
          </DialogTitle>
          <DialogDescription>
            {es ? 'Estos porcentajes expresan la jerarquía de tus elecciones en la historia. Los patrones dominante y secundario reciben mayor énfasis, mientras el resto se distribuye entre influencias más sutiles. En conjunto suman 100 %. No son probabilidades, posiciones frente a una población ni hallazgos clínicos. Los índices de motivación y decisión son escalas independientes de 0 a 100.' : 'These percentages express the hierarchy in your story choices. The dominant and secondary patterns are emphasized, while the remaining alignment is distributed across quieter influences. They add up to 100%. They are not probabilities, population rankings or clinical findings. Motivation and decision indices are independent scales from 0 to 100.'}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
