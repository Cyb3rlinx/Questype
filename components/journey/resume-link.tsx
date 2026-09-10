'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '../i18n-provider';
import { startJourneySoundtrack } from './soundtrack';
import type { SessionView } from '@/lib/client-api';
export function ResumeLink() {
  const { locale } = useLocale();
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/session')
      .then(async (r) => {
        if (r.ok) {
          const d = (await r.json()) as SessionView;
          setHref(
            d.result_id
              ? `/result/${d.result_id}`
              : `/journey/${d.journey.slug}/play`,
          );
        }
      })
      .catch(() => {});
  }, []);
  return href ? (
    <Link
      href={href}
      className="text-link"
      onClick={href.endsWith('/play') ? startJourneySoundtrack : undefined}
    >
      {locale === 'es' ? 'Continúa tu historia' : 'Continue your story'}{' '}
      <span aria-hidden="true">→</span>
    </Link>
  ) : null;
}
