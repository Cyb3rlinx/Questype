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
  const es = shared.locale === 'es';
  return (
    <>
      <SiteHeader />
      <main id="main" className="shared-result-page">
        <div className="shared-result-art">
          <img
            src={shared.image_url ?? '/images/valley-wide.webp'}
            width={900}
            height={1600}
            fetchPriority="high"
            alt={es ? 'Retrato del arquetipo compartido' : 'Portrait of the shared archetype'}
          />
        </div>
        <div className="shared-result-copy">
          <Compass size={39} strokeWidth={1} />
          <span className="eyebrow">{es ? 'UN VIAJE REVELADO' : 'A JOURNEY REVEALED'}</span>
          <p>
            {shared.display_name
              ? (es ? `La historia de ${shared.display_name}, revelada` : `${shared.display_name}’s story revealed`)
              : (es ? 'La historia de un viajero, revelada' : 'One traveler’s story revealed')}
          </p>
          <h1>{shared.title}</h1>
          <div className="shared-archetypes">
            {shared.archetypes.map((a) => (
              <div key={a.name}>
                <span>
                  {a.percentage}
                  <small>%</small>
                </span>
                <p>{es ? a.name : `The ${a.name}`}</p>
              </div>
            ))}
          </div>
          <blockquote>“{shared.quote}”</blockquote>
          <Link href="/start" className="button button-gold">
            {es ? 'Descubre tus propios arquetipos' : 'Discover your own archetypes'} <ArrowUpRight size={17} />
          </Link>
          <p className="small-note">
            {es ? 'Una experiencia narrativa para la reflexión personal. Tu resultado será únicamente tuyo.' : 'A narrative experience for self-reflection. Your result will be your own.'}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
