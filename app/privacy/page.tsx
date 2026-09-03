'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SiteHeader, SiteFooter } from '@/components/journey/chrome';
import { requestJson } from '@/lib/client-api';
export default function PrivacyPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setBusy(true);
    try {
      await requestJson('/api/session', 'DELETE');
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <SiteHeader compact />
      <main id="main" className="privacy-page page-width">
        <ShieldCheck size={34} strokeWidth={1} />
        <span className="eyebrow">YOUR STORY BELONGS TO YOU</span>
        <h1>
          Privacy &<br />
          <em>your choices.</em>
        </h1>
        <section>
          <h2>A private place to explore</h2>
          <p>
            Your optional name, character representation, story choices and
            results are saved so you can continue your journey. No account,
            email address or contact information is required.
          </p>
          <h2>Returning to your journey</h2>
          <p>
            A private browser cookie lets you return to saved progress and
            results. Clearing that cookie or switching browsers removes access
            to this anonymous journey. Your choices are stored on the server,
            not in browser storage.
          </p>
          <h2>Sharing is your choice</h2>
          <p>
            A share link includes your character title, the archetypes you
            select and a short reflection. Your name is left out unless you
            choose to include it. Raw choices and private pressure patterns are
            never part of a shared result. You can revoke the link from the
            result page.
          </p>
          <h2>A tool for reflection</h2>
          <p>
            Your result comes from the story’s deterministic scoring model and a
            curated interpretation. It is designed for self-reflection and
            entertainment and does not provide psychological or medical
            diagnosis. No external AI service receives your answers in this
            version.
          </p>
          <h2>A fresh start</h2>
          <p>
            Delete all journeys and results saved for this browser. This also
            removes their share links. Downloaded reports and cards remain
            wherever you saved them.
          </p>
          <button
            className="button button-outline"
            onClick={() => setOpen(true)}
          >
            <Trash2 size={16} />
            Delete my journey data
          </button>
        </section>
      </main>
      <SiteFooter />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="story-dialog">
          <AlertDialogTitle className="dialog-heading">
            Leave these stories behind?
          </AlertDialogTitle>
          <AlertDialogDescription>
            All journeys, results and share links for this browser will be
            deleted. This cannot be undone.
          </AlertDialogDescription>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <AlertDialogCancel className="button button-outline">
              Keep my stories
            </AlertDialogCancel>
            <button
              className="button button-gold"
              disabled={busy}
              onClick={remove}
            >
              {busy ? 'Deleting…' : 'Delete my data'}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
