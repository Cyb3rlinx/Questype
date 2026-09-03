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
  return (
    <>
      <section className="landing-hero">
        <img
          className="hero-landscape"
          src="/images/valley-wide.webp"
          alt="An immense green valley, waterfalls and distant mountains seen from a traveler's overlook"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <SiteHeader overlay />
        <main id="main" className="hero-content page-width">
          <div className="eyebrow">
            <span className="small-line" /> THE UNWRITTEN ROAD
          </div>
          <h1>
            A world to explore.
            <br />A self to <em>discover.</em>
          </h1>
          <p className="hero-intro">
            Every journey reveals something.
            <br />
            This one reveals a little more of you.
          </p>
          <p className="hero-description">
            Step into a living story. Make choices that feel like yours.
            <br className="desktop-only" /> Discover the archetypes woven
            through your path.
          </p>
          <div className="hero-actions">
            <Link className="button button-gold" href="/start">
              Begin your journey <ArrowUpRight size={18} />
            </Link>
            <ResumeLink />
          </div>
          <div className="journey-facts">
            <span>15 story moments</span>
            <span>12 archetypes</span>
            <span>No account needed</span>
          </div>
        </main>
        <div className="hero-bottom page-width">
          <a href="#experience" className="scroll-cue">
            <ArrowDown size={16} /> A little further, a little deeper
          </a>
          <div className="location-caption">
            <Compass size={25} />
            <span>
              JOURNEY I<small>The valley of Veyr</small>
            </span>
          </div>
        </div>
      </section>
      <section id="experience" className="experience-section page-width">
        <div className="section-intro">
          <span className="eyebrow">LET THE STORY FIND YOU</span>
          <h2>
            You don’t need all the answers.
            <br />
            <em>Just a first step.</em>
          </h2>
          <p>
            An unexpected invitation. A road that changes. A choice only you can
            make. Discover yourself through the way you move through a story.
          </p>
        </div>
        <div className="experience-steps">
          {[
            {
              n: '01',
              Icon: BookOpen,
              title: 'Enter another world',
              body: 'Leave the familiar behind. Meet strangers, uncover mysteries and find your way through fifteen moments.',
            },
            {
              n: '02',
              Icon: Compass,
              title: 'Follow your own instincts',
              body: 'There is no perfect path. Choose what feels natural when the story places a decision in your hands.',
            },
            {
              n: '03',
              Icon: Sparkles,
              title: 'Discover your inner pattern',
              body: 'Meet your dominant archetypes, explore your strengths and reflect on the possibilities still ahead.',
            },
          ].map(({ n, Icon, title, body }) => (
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
      </section>
      <section className="threshold-section" id="how-it-works">
        <div className="threshold-image">
          <img
            src="/images/forest-waystation.webp"
            alt="A mossy stone path leading to a waystation in an ancient forest"
            loading="lazy"
          />
        </div>
        <div className="threshold-copy">
          <span className="eyebrow">MORE THAN A SINGLE LABEL</span>
          <h2>
            You contain
            <br />
            <em>many possibilities.</em>
          </h2>
          <p>
            The explorer who seeks another horizon. The caregiver who notices
            who’s been left behind. The creator who sees a different way.
          </p>
          <p>
            Your journey reveals how these patterns come together—in your
            decisions, your connections and the things that move you.
          </p>
          <Link href="/start" className="text-link">
            Find the pattern in your path <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="archetypes-section page-width" id="archetypes">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">TWELVE WAYS OF MEETING THE WORLD</span>
            <h2>
              Which voices guide <em>you?</em>
            </h2>
          </div>
          <p>
            Every archetype has a gift.
            <br />
            Your story is a blend of them.
          </p>
        </div>
        <div className="archetype-grid">
          {archetypes.map((a, i) => {
            const Icon = symbols[i];
            return (
              <article className="archetype-tile" key={a.slug}>
                <Icon size={26} strokeWidth={1.2} />
                <h3>The {a.name}</h3>
                <p>{a.core_desire}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="closing-section">
        <Compass size={36} strokeWidth={1} />
        <h2>
          Every path begins
          <br />
          with <em>one choice.</em>
        </h2>
        <Link href="/start" className="button button-gold">
          Begin your journey <ArrowUpRight size={18} />
        </Link>
        <span className="quiet-text">Your story. Your pace. Your path.</span>
      </section>
      <SiteFooter />
    </>
  );
}
