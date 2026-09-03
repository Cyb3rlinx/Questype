import Link from 'next/link';
import { SiteHeader } from '@/components/journey/chrome';
export default function NotFound() {
  return (
    <>
      <SiteHeader compact />
      <main id="main" className="centered-state">
        <span className="eyebrow">AN UNCHARTED TURN</span>
        <h1>
          This path isn’t
          <br />
          on <em>the map.</em>
        </h1>
        <Link href="/" className="button button-gold">
          Return to the world
        </Link>
      </main>
    </>
  );
}
