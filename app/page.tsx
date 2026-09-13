'use client';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  BookOpen,
  Sparkles,
  Feather,
  Shield,
  Heart,
  Crown,
  Flame,
  Sun,
  Users,
  WandSparkles,
  Sprout,
  Telescope,
} from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/journey/chrome';
import { archetypes } from '@/src/domain/registry/archetypes';
import { ResumeLink } from '@/components/journey/resume-link';
import { useLocale } from '@/components/i18n-provider';
import { localizeArchetype } from '@/src/i18n/archetypes';
import { JourneyCardGrid } from '@/components/journey/cards';
import { HeroBackground } from '@/components/home/hero-background';
import { listJourneyCards } from '@/src/domain/journeys/public-registry';
const symbols = [
  Sun,
  Compass,
  Telescope,
  Shield,
  Flame,
  WandSparkles,
  Heart,
  Feather,
  Sprout,
  Sparkles,
  Crown,
  Users,
];
export default function Home() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const steps = es
    ? [
        {
          n: '01',
          Icon: BookOpen,
          title: 'Entra en una historia',
          body: 'Cada Journey te sitúa dentro de un escenario fantástico diferente.',
        },
        {
          n: '02',
          Icon: Compass,
          title: 'Toma decisiones significativas',
          body: 'No hay respuestas perfectas. Cada opción representa una estrategia con beneficios y costos.',
        },
        {
          n: '03',
          Icon: Sparkles,
          title: 'Revela patrones distintos',
          body: 'Cada historia explora un área diferente: identidad, liderazgo, presión, cambio o vínculos.',
        },
        {
          n: '04',
          Icon: Feather,
          title: 'Construye tu perfil',
          body: 'Al completar más Journeys, la evidencia forma una mirada más amplia sin inventar lo que aún no fue explorado.',
        },
      ]
    : [
        {
          n: '01',
          Icon: BookOpen,
          title: 'Enter a story',
          body: 'Each Journey places you inside a different fantasy scenario.',
        },
        {
          n: '02',
          Icon: Compass,
          title: 'Make meaningful choices',
          body: 'There are no perfect answers. Every option is a strategy with benefits and costs.',
        },
        {
          n: '03',
          Icon: Sparkles,
          title: 'Reveal different patterns',
          body: 'Each story explores a different area: identity, leadership, pressure, change or connection.',
        },
        {
          n: '04',
          Icon: Feather,
          title: 'Build your profile',
          body: 'As you complete more Journeys, the evidence forms a broader view without inventing what has not been explored.',
        },
      ];
  return (
    <>
      <section className="landing-hero">
        <HeroBackground
          alt={
            es
              ? 'Un grupo de viajeros cruza un valle montañoso hacia un faro al atardecer'
              : 'A group of travelers crossing a mountain valley toward a lighthouse at sunset'
          }
        />
        <div className="hero-shade" />
        <SiteHeader overlay />
        <main id="main" className="hero-content page-width">
          <div className="eyebrow">
            <span className="small-line" />{' '}
            {es
              ? 'UN VIAJE INTERACTIVO POR TUS ARQUETIPOS'
              : 'AN INTERACTIVE ARCHETYPE JOURNEY'}
          </div>
          <h1>
            {es ? 'El camino revela' : 'The road reveals'}
            <br />
            <em>{es ? 'quién eres.' : 'who you are.'}</em>
          </h1>
          <p className="hero-intro">
            {es
              ? 'Llega una carta. Un faro espera más allá de las montañas.'
              : 'A letter arrives. A lighthouse waits beyond the mountains.'}
            <br className="desktop-only" />{' '}
            {es
              ? 'La forma en que llegues revelará los patrones que ya se mueven dentro de ti.'
              : 'How you reach it will reveal the patterns already moving within you.'}
          </p>
          <div className="hero-actions">
            <Link className="button button-gold" href="/start">
              {es ? 'Comienza el viaje' : 'Begin the journey'}{' '}
              <ArrowUpRight size={18} />
            </Link>
            <ResumeLink />
          </div>
          <div className="journey-facts">
            <span>{es ? '15 momentos de historia' : '15 story moments'}</span>
            <span>{es ? '12 arquetipos' : '12 archetypes'}</span>
            <span>{es ? 'Cerca de 20 minutos' : 'About 20 minutes'}</span>
          </div>
        </main>
        <div className="hero-bottom page-width">
          <a href="#experience" className="scroll-cue">
            <ArrowDown size={16} />{' '}
            {es ? 'Descubre la experiencia' : 'Discover the experience'}
          </a>
          <div className="location-caption">
            <Compass size={25} />
            <span>
              {es ? 'VIAJE I' : 'JOURNEY I'}
              <small>
                {es ? 'El camino hacia el faro' : 'The road to the lighthouse'}
              </small>
            </span>
          </div>
        </div>
      </section>
      <section id="experience" className="experience-section page-width">
        <div className="section-intro">
          <span className="eyebrow">
            {es
              ? 'DEJA QUE LA HISTORIA TE ENCUENTRE'
              : 'LET THE STORY FIND YOU'}
          </span>
          <h2>
            {es
              ? 'No necesitas todas las respuestas.'
              : 'You don’t need all the answers.'}
            <br />
            <em>{es ? 'Solo dar el primer paso.' : 'Just a first step.'}</em>
          </h2>
          <p>
            {es
              ? 'Una invitación inesperada. Un camino que cambia. Una elección que solo tú puedes hacer. Descúbrete a través de la manera en que avanzas por una historia.'
              : 'An unexpected invitation. A road that changes. A choice only you can make. Discover yourself through the way you move through a story.'}
          </p>
        </div>
        <div className="experience-steps">
          {steps.map(({ n, Icon, title, body }) => (
            <article className="experience-step" key={n}>
              <div className="step-heading">
                <span>{n}</span>
                <Icon size={23} strokeWidth={1.3} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="experience-scope-note">
          {es
            ? 'Questype está diseñado para la reflexión y el autoconocimiento. No es un diagnóstico clínico ni sustituye una evaluación psicológica profesional.'
            : 'Questype is designed for reflection and personal insight. It is not a clinical diagnosis or a substitute for professional psychological assessment.'}
        </p>
      </section>
      <section className="journey-discovery-section page-width" id="journeys">
        <div className="section-intro">
          <span className="eyebrow">
            {es
              ? 'DISTINTAS HISTORIAS. DISTINTAS SITUACIONES.'
              : 'DIFFERENT STORIES. DIFFERENT SITUATIONS.'}
          </span>
          <h2>
            {es ? 'Elige un ' : 'Choose a '}
            <em>Journey.</em>
          </h2>
          <p>
            {es
              ? 'Cada mundo explora un aspecto distinto de cómo piensas, decides, lideras, te adaptas y te relacionas con otras personas.'
              : 'Every world explores a different side of how you think, decide, lead, adapt and relate to others.'}
          </p>
        </div>
        <JourneyCardGrid journeys={listJourneyCards()} />
      </section>
      <section className="threshold-section" id="how-it-works">
        <div className="threshold-image">
          <img
            src="/images/many-possibilities.webp"
            srcSet="/images/many-possibilities-sm.webp 900w, /images/many-possibilities.webp 1672w"
            sizes="(max-width: 680px) 100vw, 50vw"
            width={1672}
            height={941}
            alt={
              es
                ? 'Dos viajeros contemplan una antigua ciudad entre árboles monumentales y cascadas'
                : 'Two travelers look toward an ancient city among monumental trees and waterfalls'
            }
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="threshold-copy">
          <span className="eyebrow">
            {es ? 'MÁS QUE UNA SOLA ETIQUETA' : 'MORE THAN A SINGLE LABEL'}
          </span>
          <h2>
            {es ? 'Dentro de ti existen' : 'You contain'}
            <br />
            <em>{es ? 'muchas posibilidades.' : 'many possibilities.'}</em>
          </h2>
          <p>
            {es
              ? 'El explorador que busca otro horizonte. El cuidador que percibe quién ha quedado atrás. El creador que imagina un camino diferente.'
              : 'The explorer who seeks another horizon. The caregiver who notices who’s been left behind. The creator who sees a different way.'}
          </p>
          <p>
            {es
              ? 'Tu viaje revela cómo se combinan estos patrones en tus decisiones, tus vínculos y aquello que te impulsa.'
              : 'Your journey reveals how these patterns come together—in your decisions, your connections and the things that move you.'}
          </p>
          <Link href="/start" className="text-link">
            {es
              ? 'Descubre el patrón de tu camino'
              : 'Find the pattern in your path'}{' '}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="archetypes-section page-width" id="archetypes">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">
              {es
                ? 'DOCE MANERAS DE ENCONTRARTE CON EL MUNDO'
                : 'TWELVE WAYS OF MEETING THE WORLD'}
            </span>
            <h2>
              {es ? '¿Qué voces te' : 'Which voices guide'}{' '}
              <em>{es ? 'guían?' : 'you?'}</em>
            </h2>
          </div>
          <p>
            {es
              ? 'Cada arquetipo tiene un don.'
              : 'Every archetype has a gift.'}
            <br />
            {es
              ? 'Tu historia es una combinación de ellos.'
              : 'Your story is a blend of them.'}
          </p>
        </div>
        <div className="archetype-grid">
          {archetypes.map((source, i) => {
            const a = localizeArchetype(source, locale);
            const Icon = symbols[i];
            return (
              <article className="archetype-tile" key={a.slug}>
                <Icon size={26} strokeWidth={1.2} />
                <h3>{es ? a.name : `The ${a.name}`}</h3>
                <p>{a.core_desire}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="closing-section">
        <Compass size={36} strokeWidth={1} />
        <h2>
          {es ? 'Todo camino comienza' : 'Every path begins'}
          <br />
          {es ? 'con ' : 'with '}
          <em>{es ? 'una elección.' : 'one choice.'}</em>
        </h2>
        <Link href="/start" className="button button-gold">
          {es ? 'Comienza tu viaje' : 'Begin your journey'}{' '}
          <ArrowUpRight size={18} />
        </Link>
        <span className="quiet-text">
          {es
            ? 'Tu historia. Tu ritmo. Tu camino.'
            : 'Your story. Your pace. Your path.'}
        </span>
      </section>
      <SiteFooter />
    </>
  );
}
