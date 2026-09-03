import Link from 'next/link';
import { Compass, ArrowUpRight } from 'lucide-react';
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Archetype home">
      <Compass size={29} strokeWidth={1.1} />
      <span>
        ARCHETYPE<small>THE STORY WITHIN</small>
      </span>
    </Link>
  );
}
export function SiteHeader({
  overlay = false,
  compact = false,
}: {
  overlay?: boolean;
  compact?: boolean;
}) {
  return (
    <header className={`site-header ${overlay ? 'overlay-header' : ''}`}>
      <div className="header-inner page-width">
        <Brand />
        {!compact && (
          <nav aria-label="Main navigation">
            <Link href="/#experience">The experience</Link>
            <Link href="/#archetypes">The archetypes</Link>
            <Link href="/#how-it-works">Your journey</Link>
          </nav>
        )}
        <Link href={compact ? '/' : '/start'} className="header-action">
          {compact ? 'Back to the world' : 'Begin your journey'}
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer page-width">
      <div>
        <Brand />
        <p>An adventure in self-discovery.</p>
      </div>
      <p className="footer-notice">
        For self-reflection and entertainment.
        <br />
        This experience does not provide psychological or medical diagnosis.
      </p>
      <Link href="/privacy">Privacy & your choices</Link>
    </footer>
  );
}
