'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export function ResumeLink() {
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/session')
      .then(async (r) => {
        if (r.ok) {
          const d = (await r.json()) as { result_id: string | null };
          setHref(d.result_id ? `/result/${d.result_id}` : '/journey');
        }
      })
      .catch(() => {});
  }, []);
  return href ? (
    <Link href={href} className="text-link">
      Continue your story <span aria-hidden="true">→</span>
    </Link>
  ) : null;
}
