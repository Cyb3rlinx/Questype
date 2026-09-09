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
import { useLocale } from '../i18n-provider';
import { archetypeName, localizedCharacterTitle } from '@/src/i18n/archetypes';
import { archetypeImage, archetypeImageAlt } from '@/src/domain/archetype-images';
type SavedShare = {
  url: string | null;
  include_name: boolean;
  top_count: 1 | 2;
  locale: 'en' | 'es';
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
  const { locale } = useLocale();
  const es = locale === 'es';
  const [format, setFormat] = useState<CardFormat>('instagram_portrait');
  const [includeName, setIncludeName] = useState(false);
  const [topCount, setTopCount] = useState<1 | 2>(2);
  const [saved, setSaved] = useState<SavedShare | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/results/${result.profile.id}/share`;
  const primaryImage = archetypeImage(result.profile.archetypes.primary.slug, result.profile.user.character_gender);
  const primaryName = result.profile.archetypes.primary.name;
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
    saved?.include_name === includeName && saved?.top_count === topCount && saved?.locale === locale;
  const currentUrl = clean ? saved?.url : null;
  const projection = () =>
    createPublicProjection(result.profile, {
      includeName,
      topCount,
      quote: result.interpretation.social.quote,
      imageUrl: new URL(primaryImage, window.location.origin).href,
      locale,
    });
  const caption = () => {
    const types = result.profile.archetypes.all
      .slice(0, topCount)
      .map((a) => `${archetypeName(a.slug, a.name, locale)} (${a.normalized_percentage}%)`)
      .join(', ');
    return format === 'linkedin'
      ? (es ? `Un momento para reflexionar: mi viaje de Questype reveló ${types}. ${result.interpretation.social.quote}` : `A moment for reflection: my Questype journey revealed ${types}. ${result.interpretation.social.quote}`)
      : (es ? `Mi historia reveló ${types}.\n“${result.interpretation.social.quote}”\nDescubre tu historia con Questype.` : `My story revealed ${types}.\n“${result.interpretation.social.quote}”\nDiscover your story with Questype.`);
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
      locale,
    });
    setSaved({
      url: shared.url,
      include_name: includeName,
      top_count: topCount,
      locale,
    });
    return shared;
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="story-dialog share-dialog">
        <DialogTitle className="dialog-heading">
          {es ? 'Una historia que vale la pena compartir.' : 'A story worth sharing.'}
        </DialogTitle>
        <DialogDescription>
          {es ? 'Lleva tus arquetipos al mundo. Elige qué viaja con ellos.' : 'Take your archetypes into the world. Choose what travels with them.'}
        </DialogDescription>
        <div className="share-preview">
          <img src={primaryImage} width={900} height={1600} alt={archetypeImageAlt(result.profile.archetypes.primary.slug, primaryName, result.profile.user.character_gender, locale)} />
          <div>
            <span>QUESTYPE · {es ? 'LA HISTORIA INTERIOR' : 'THE STORY WITHIN'}</span>
            <div className="share-preview-summary">
              <p>
                {result.profile.archetypes.all
                  .slice(0, topCount)
                  .map((a) => `${archetypeName(a.slug, a.name, locale)} ${a.normalized_percentage}%`)
                  .join(' · ')}
              </p>
              {includeName && result.profile.user.name && (
                <small>{result.profile.user.name}</small>
              )}
              <h3>{localizedCharacterTitle(result.profile, locale)}</h3>
            </div>
          </div>
        </div>
        <div className="share-settings">
          <label>
            {es ? 'Formato de tarjeta' : 'Card format'}
            <NativeSelect
              value={format}
              onChange={(e) => setFormat(e.target.value as CardFormat)}
              aria-label={es ? 'Formato de tarjeta' : 'Card format'}
            >
              {Object.keys(CARD_FORMATS).map((key) => (
                <NativeSelectOption key={key} value={key}>
                  {
                    (
                      {
                        instagram_portrait: 'Instagram · 4:5',
                        instagram_story: es ? 'Historia de Instagram · 9:16' : 'Instagram Story · 9:16',
                        linkedin: es ? 'LinkedIn · Profesional' : 'LinkedIn · Professional',
                        x: es ? 'X · Horizontal' : 'X · Landscape',
                      } as Record<string, string>
                    )[key]
                  }
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label>
            {es ? 'Arquetipos para incluir' : 'Archetypes to include'}
            <NativeSelect
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value) as 1 | 2)}
              aria-label={es ? 'Arquetipos para incluir' : 'Archetypes to include'}
            >
              {[1, 2].map((n) => (
                <NativeSelectOption key={n} value={n}>
                  {es ? `Primeros ${n}` : `Top ${n}`}
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
          {es ? 'Incluir mi nombre' : 'Include my name'}
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
                  branding: 'QUESTYPE',
                });
                setNotice(es ? 'Tu tarjeta de resultado está lista.' : 'Your result card is ready.');
              })
            }
          >
            <Download size={16} />
            {es ? 'Descargar tarjeta' : 'Download card'}
          </button>
          <button
            disabled={busy}
            className="button button-outline"
            onClick={() =>
              run(async () => {
                await navigator.clipboard.writeText(
                  caption() + (currentUrl ? `\n\n${currentUrl}` : ''),
                );
                setNotice(es ? 'Texto copiado.' : 'Caption copied.');
              })
            }
          >
            <Copy size={16} />
            {es ? 'Copiar texto' : 'Copy caption'}
          </button>
          <button
            disabled={busy}
            className="button button-outline"
            onClick={() =>
              run(async () => {
                const shared = await link();
                await navigator.clipboard.writeText(shared.url);
                setNotice(es ? 'Tu resultado seleccionado fue compartido. Enlace copiado.' : 'Your selected result is shared. Link copied.');
              })
            }
          >
            <Link2 size={16} />
            {saved?.url ? (es ? 'Actualizar y copiar enlace' : 'Update & copy link') : (es ? 'Crear enlace para compartir' : 'Create a share link')}
          </button>
          <button
            disabled={busy}
            className="button button-outline"
            onClick={() =>
              run(async () => {
                const shared = await link();
                if (navigator.share)
                  await navigator.share({
                    title: localizedCharacterTitle(result.profile, locale),
                    text: caption(),
                    url: shared.url,
                  });
                else {
                  await navigator.clipboard.writeText(shared.url);
                  setNotice(es ? 'Enlace copiado. Pégalo en tu aplicación favorita.' : 'Link copied. Paste it into your favorite app.');
                }
              })
            }
          >
            <Share2 size={16} />
            {es ? 'Compartir mediante…' : 'Share via…'}
          </button>
        </div>
        {saved?.url && (
          <>
            <div className="shared-link">
              <a href={saved.url} target="_blank" rel="noreferrer">
                {es ? 'Ver resultado compartido ↗' : 'View shared result ↗'}
              </a>
              <button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await requestJson(endpoint, 'DELETE');
                    setSaved(null);
                    setNotice(es ? 'Enlace compartido revocado.' : 'Share link revoked.');
                  })
                }
              >
                {es ? 'Revocar enlace' : 'Revoke link'}
              </button>
            </div>
            {!clean && (
              <p className="small-note">
                {es ? 'Tu enlace aún usa la selección anterior. Actualízalo para aplicar estos cambios. Las descargas y los textos omiten el enlace hasta entonces.' : 'Your link still uses the earlier selection. Update it to apply these changes. Downloads and captions omit the link until then.'}
              </p>
            )}
          </>
        )}
        <p className="share-notice" aria-live="polite">
          {notice}
        </p>
        <p className="small-note">
          {es ? 'Tus decisiones y patrones privados bajo presión permanecen privados. Descargar una tarjeta no crea un enlace público.' : 'Story choices and private pressure patterns stay private. Downloading a card does not create a public link.'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
