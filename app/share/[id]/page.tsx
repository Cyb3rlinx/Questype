import Link from 'next/link';
import { Compass, ArrowUpRight } from 'lucide-react';
import { database } from '@/lib/server-api';
import { getShare } from '@/src/application/web-service';
import { SiteHeader, SiteFooter } from '@/components/journey/chrome';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let shared;
  try {
    shared = await getShare(database(), (await params).id);
  } catch {
    notFound();
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="shared-result-page">
        <div className="shared-result-art">
          <img
            src="/images/valley-wide.webp"
            alt="A traveler overlooking a green valley"
          />
        </div>
        <div className="shared-result-copy">
          <Compass size={39} strokeWidth={1} />
          <span className="eyebrow">A JOURNEY REVEALED</span>
          <p>
            {shared.display_name
              ? `${shared.display_name}’s story revealed`
              : 'One traveler’s story revealed'}
          </p>
          <h1>{shared.title}</h1>
          <div className="shared-archetypes">
            {shared.archetypes.map((a) => (
              <div key={a.name}>
                <span>
                  {a.percentage}
                  <small>%</small>
                </span>
                <p>The {a.name}</p>
              </div>
            ))}
          </div>
          <blockquote>“{shared.quote}”</blockquote>
          <Link href="/start" className="button button-gold">
            Discover your own archetypes <ArrowUpRight size={17} />
          </Link>
          <p className="small-note">
            A narrative experience for self-reflection. Your result will be your
            own.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
