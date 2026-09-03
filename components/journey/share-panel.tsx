'use client';
import { useEffect, useState } from 'react';
import { Copy, Download, Link2, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { requestJson } from '@/lib/client-api';
import {
  createPublicProjection,
  CARD_FORMATS,
  type CardFormat,
} from '@/src/sharing/contracts';
import type { ResultPayload } from './result-view';
type SavedShare = {
  url: string | null;
  include_name: boolean;
  top_count: 1 | 2 | 3;
};
export function SharePanel({
  open,
  onOpenChange,
  result,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  result: ResultPayload;
}) {
  const [format, setFormat] = useState<CardFormat>('instagram_portrait');
  const [includeName, setIncludeName] = useState(false);
  const [topCount, setTopCount] = useState<1 | 2 | 3>(3);
  const [saved, setSaved] = useState<SavedShare | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/results/${result.profile.id}/share`;
  useEffect(() => {
    if (!open) return;
    let active = true;
    setBusy(true);
    requestJson<SavedShare>(endpoint)
      .then((value) => {
        if (active) {
          setSaved(value);
          setIncludeName(value.include_name);
          setTopCount(value.top_count);
        }
      })
      .catch((error) => {
        if (active) setNotice(error.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [open, endpoint]);
  const clean =
    saved?.include_name === includeName && saved?.top_count === topCount;
  const currentUrl = clean ? saved?.url : null;
  const projection = () =>
    createPublicProjection(result.profile, {
      includeName,
      topCount,
      quote: result.interpretation.social.quote,
      imageUrl: new URL('/images/valley-wide.webp', window.location.origin)
        .href,
    });
  const caption = () => {
    const types = result.profile.archetypes.all
      .slice(0, topCount)
      .map((a) => `${a.name} (${a.normalized_percentage}%)`)
      .join(', ');
    return format === 'linkedin'
      ? `A moment for reflection: my Archetype journey revealed ${types}. ${result.interpretation.social.quote}`
      : `My story revealed ${types}.\n“${result.interpretation.social.quote}”\nDiscover your story with Archetype.`;
  };
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setNotice('');
    try {
      await task();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function link() {
    const shared = await requestJson<{ url: string }>(endpoint, 'POST', {
      include_name: includeName,
      top_count: topCount,
    });
    setSaved({
      url: shared.url,
      include_name: includeName,
      top_count: topCount,
    });
    return shared;
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="story-dialog share-dialog">
        <DialogTitle className="dialog-heading">
          A story worth sharing.
        </DialogTitle>
        <DialogDescription>
          Take your archetypes into the world. Choose what travels with them.
        </DialogDescription>
        <div className="share-preview">
          <img src="/images/valley-wide.webp" alt="Your story landscape" />
          <div>
            <span>ARCHETYPE · THE STORY WITHIN</span>
            <h3>{result.profile.character.title}</h3>
            <p>
              {result.profile.archetypes.all
                .slice(0, topCount)
                .map((a) => `${a.name} ${a.normalized_percentage}%`)
                .join(' · ')}
            </p>
            {includeName && result.profile.user.name && (
              <small>{result.profile.user.name}</small>
            )}
          </div>
        </div>
        <div className="share-settings">
          <label>
            Card format
            <NativeSelect
              value={format}
              onChange={(e) => setFormat(e.target.value as CardFormat)}
              aria-label="Card format"
            >
              {Object.keys(CARD_FORMATS).map((key) => (
                <NativeSelectOption key={key} value={key}>
                  {
                    (
                      {
                        instagram_portrait: 'Instagram · 4:5',
                        instagram_story: 'Instagram Story · 9:16',
                        linkedin: 'LinkedIn · Professional',
                        x: 'X · Landscape',
                      } as Record<string, string>
                    )[key]
                  }
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label>
            Archetypes to include
            <NativeSelect
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value) as 1 | 2 | 3)}
              aria-label="Archetypes to include"
            >
              {[1, 2, 3].map((n) => (
                <NativeSelectOption key={n} value={n}>
                  Top {n}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        </div>
        <label className="share-name">
          <Checkbox
            checked={includeName}
            onCheckedChange={(value) => setIncludeName(Boolean(value))}
          />
          Include my name
        </label>
        <div className="share-buttons">
          <button
            disabled={busy}
            className="button button-gold"
            onClick={() =>
              run(async () => {
                const { downloadSocialCard } =
                  await import('@/lib/export-assets');
                await downloadSocialCard({
                  format,
                  result: projection(),
                  share_url: currentUrl || `${window.location.origin}/`,
                  branding: 'ARCHETYPE',
                });
                setNotice('Your result card is ready.');
              })
            }
          >
            <Download size={16} />
            Download card
          </button>
          <button
            disabled={busy}
            className="button button-outline"
            onClick={() =>
              run(async () => {
                await navigator.clipboard.writeText(
                  caption() + (currentUrl ? `\n\n${currentUrl}` : ''),
                );
                setNotice('Caption copied.');
              })
            }
          >
            <Copy size={16} />
            Copy caption
          </button>
          <button
            disabled={busy}
            className="button button-outline"
            onClick={() =>
              run(async () => {
                const shared = await link();
                await navigator.clipboard.writeText(shared.url);
                setNotice('Your selected result is shared. Link copied.');
              })
            }
          >
            <Link2 size={16} />
            {saved?.url ? 'Update & copy link' : 'Create a share link'}
          </button>
          <button
            disabled={busy}
            className="button button-outline"
            onClick={() =>
              run(async () => {
                const shared = await link();
                if (navigator.share)
                  await navigator.share({
                    title: result.profile.character.title,
                    text: caption(),
                    url: shared.url,
                  });
                else {
                  await navigator.clipboard.writeText(shared.url);
                  setNotice('Link copied. Paste it into your favorite app.');
                }
              })
            }
          >
            <Share2 size={16} />
            Share via…
          </button>
        </div>
        {saved?.url && (
          <>
            <div className="shared-link">
              <a href={saved.url} target="_blank" rel="noreferrer">
                View shared result ↗
              </a>
              <button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await requestJson(endpoint, 'DELETE');
                    setSaved(null);
                    setNotice('Share link revoked.');
                  })
                }
              >
                Revoke link
              </button>
            </div>
            {!clean && (
              <p className="small-note">
                Your link still uses the earlier selection. Update it to apply
                these changes. Downloads and captions omit the link until then.
              </p>
            )}
          </>
        )}
        <p className="share-notice" aria-live="polite">
          {notice}
        </p>
        <p className="small-note">
          Story choices and private pressure patterns stay private. Downloading
          a card does not create a public link.
        </p>
      </DialogContent>
    </Dialog>
  );
}
