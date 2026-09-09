import type { ReportData } from '@/src/reports/data';
import { CARD_FORMATS, type SocialCardData } from '@/src/sharing/contracts';
function save(bytes: BlobPart, type: string, name: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function bytes(url: string, es = false) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(es ? 'No se pudo cargar un recurso del informe. Inténtalo de nuevo.' : 'A report asset could not be loaded. Please try again.');
  return new Uint8Array(await response.arrayBuffer());
}
async function pngBytes(url: string, es = false) {
  const image = new Image();
  image.src = url;
  try { await image.decode(); } catch { throw new Error(es ? 'No se pudo cargar la imagen de tu arquetipo.' : 'Your archetype image could not be loaded.'); }
  const scale = Math.min(1, 900 / image.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error(es ? 'Tu navegador no pudo preparar la imagen del informe.' : 'Your browser could not prepare the report image.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error(es ? 'No se pudo preparar la imagen del informe.' : 'The report image could not be prepared.');
  return new Uint8Array(await blob.arrayBuffer());
}
export async function downloadReport(report: ReportData) {
  const { renderReportPdf } = await import('./pdf-renderer');
  const es = report.locale === 'es';
  const [bodyFont, headingFont, landscape] = await Promise.all([
    bytes('/fonts/body.woff', es),
    bytes('/fonts/heading.woff', es),
    pngBytes(report.cover.character_image_url ?? '/images/valley-wide.webp', es),
  ]);
  await document.fonts.ready;
  let nameImage: Uint8Array | undefined;
  // Browser fallback fonts support the traveler's own script without sending their name elsewhere.
  if (report.cover.user_name) {
    const canvas = document.createElement('canvas');
    canvas.width = 1473;
    canvas.height = 90;
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error(
        es ? 'Tu navegador no pudo generar el informe. Inténtalo de nuevo.' : 'Your browser could not render the report. Please try again.',
      );
    context.font = '36px "DM Sans", sans-serif';
    context.fillStyle = '#c4d1ba';
    context.textBaseline = 'top';
    context.fillText(report.cover.user_name, 0, 0, 1473);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (blob) nameImage = new Uint8Array(await blob.arrayBuffer());
  }
  const file = await renderReportPdf(report, {
    bodyFont,
    headingFont,
    landscape,
    nameImage,
  });
  save(new Uint8Array(file), 'application/pdf', report.locale === 'es' ? 'mi-viaje-arquetipico.pdf' : 'my-archetype-journey.pdf');
}
export async function downloadSocialCard(card: SocialCardData) {
  const es = card.result.locale === 'es';
  await document.fonts.ready;
  const format = CARD_FORMATS[card.format];
  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error(es ? 'La exportación de imágenes no está disponible en este navegador.' : 'Image export is not available in this browser.');
  const image = new Image();
  image.src = card.result.image_url ?? '/images/valley-wide.webp';
  await image.decode();
  const w = canvas.width,
    h = canvas.height,
    pad = w * 0.07;
  context.fillStyle = '#102218';
  context.fillRect(0, 0, w, h);
  const photoHeight = h * (h > w ? 0.55 : 0.8);
  const ratio = Math.max(w / image.width, photoHeight / image.height);
  context.drawImage(
    image,
    (w - image.width * ratio) / 2,
    0,
    image.width * ratio,
    image.height * ratio,
  );
  const gradient = context.createLinearGradient(
    0,
    photoHeight * 0.35,
    0,
    photoHeight + 80,
  );
  gradient.addColorStop(0, '#10221800');
  gradient.addColorStop(1, '#102218');
  context.fillStyle = gradient;
  context.fillRect(0, 0, w, photoHeight + 80);
  context.fillStyle = '#e1cfaa';
  context.font = `500 ${w * 0.02}px "DM Sans"`;
  context.fillText(es ? 'QUESTYPE  /  LA HISTORIA INTERIOR' : 'QUESTYPE  /  THE STORY WITHIN', pad, pad);
  const titleSize = w * (h > w ? 0.065 : 0.05);
  let y = h > w ? photoHeight + 30 : h * 0.31;
  context.font = `400 ${titleSize}px "Cormorant Garamond"`;
  context.fillStyle = '#f2f0e6';
  function lines(text: string, max: number) {
    const output: string[] = [];
    let line = '';
    for (const word of text.split(' ')) {
      const test = line ? line + ' ' + word : word;
      if (context!.measureText(test).width > max && line) {
        output.push(line);
        line = word;
      } else line = test;
    }
    if (line) output.push(line);
    return output;
  }
  for (const line of lines(card.result.title, w - pad * 2)) {
    context.fillText(line, pad, y);
    y += titleSize * 1.05;
  }
  y += w * (h > w ? 0.04 : 0.025);
  context.font = `400 ${w * 0.026}px "DM Sans"`;
  context.fillStyle = '#d7c39a';
  if (h > w) {
    for (const a of card.result.archetypes) {
      context.fillText(`${a.name}  ${a.percentage}%`, pad, y);
      y += w * 0.046;
    }
  } else {
    context.fillText(
      card.result.archetypes
        .map((a) => `${a.name} ${a.percentage}%`)
        .join('   ·   '),
      pad,
      y,
      w - pad * 2,
    );
    y += w * 0.03;
  }
  y += w * 0.026;
  context.font = `italic ${w * 0.03}px "Cormorant Garamond"`;
  context.fillStyle = '#bbc9ad';
  for (const line of lines('“' + card.result.quote + '”', w - pad * 2)) {
    if (y > h - pad * 1.8) break;
    context.fillText(line, pad, y);
    y += w * 0.036;
  }
  context.font = `400 ${w * 0.017}px "DM Sans"`;
  context.fillStyle = '#96a88a';
  if (card.result.display_name)
    context.fillText(
      card.result.display_name,
      pad,
      h - pad * 0.95,
      w - pad * 2,
    );
  const shareUrl = new URL(card.share_url);
  context.fillText(
    shareUrl.host + (shareUrl.pathname === '/' ? '' : shareUrl.pathname),
    pad,
    h - pad * 0.5,
    w - pad * 2,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob)
    throw new Error(es ? 'No fue posible crear la tarjeta. Inténtalo de nuevo.' : 'The card could not be created. Please try again.');
  save(blob, 'image/png', `${es ? 'mi-arquetipo' : 'my-archetype'}-${card.format}.png`);
}
