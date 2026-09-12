import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  profileReportSchema,
  type ProfileReportData,
} from '../src/profile/report.js';

export async function renderProfileReportPdf(
  input: ProfileReportData,
  assets: { bodyFont: Uint8Array; headingFont: Uint8Array },
) {
  const report = profileReportSchema.parse(input);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const body = await pdf.embedFont(assets.bodyFont, { subset: true });
  const heading = await pdf.embedFont(assets.headingFont, { subset: true });
  const width = 595.28;
  const height = 841.89;
  const margin = 52;
  const green = rgb(0.063, 0.114, 0.094);
  const gold = rgb(0.72, 0.63, 0.43);
  const ink = rgb(0.13, 0.19, 0.15);
  const muted = rgb(0.37, 0.43, 0.35);
  const es = report.locale === 'es';
  const wrap = (
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ) => {
    const lines: string[] = [];
    let line = '';
    for (const word of text.replaceAll('\n', ' ').split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) line = next;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  };
  const footer = (page: PDFPage, number: number) => {
    page.drawLine({
      start: { x: margin, y: 44 },
      end: { x: width - margin, y: 44 },
      color: rgb(0.83, 0.86, 0.81),
      thickness: 0.5,
    });
    page.drawText(
      es
        ? 'QUESTYPE  /  PERFIL ACUMULATIVO'
        : 'QUESTYPE  /  ACCUMULATED PROFILE',
      { x: margin, y: 28, size: 7, font: body, color: muted },
    );
    page.drawText(String(number), {
      x: width - margin - 7,
      y: 28,
      size: 8,
      font: body,
      color: muted,
    });
  };

  const cover = pdf.addPage([width, height]);
  cover.drawRectangle({ x: 0, y: 0, width, height, color: green });
  cover.drawText('QUESTYPE', {
    x: margin,
    y: height - 62,
    size: 17,
    font: heading,
    color: rgb(0.96, 0.96, 0.9),
  });
  cover.drawText(es ? 'TU PERFIL ACUMULATIVO' : 'YOUR ACCUMULATED PROFILE', {
    x: margin,
    y: 560,
    size: 10,
    font: body,
    color: gold,
  });
  const coverTitle =
    report.displayName ??
    (es ? 'La historia que sigues escribiendo' : 'The story you keep writing');
  let coverY = 510;
  for (const line of wrap(coverTitle, heading, 42, width - margin * 2)) {
    cover.drawText(line, {
      x: margin,
      y: coverY,
      size: 42,
      font: heading,
      color: rgb(0.95, 0.95, 0.89),
    });
    coverY -= 48;
  }
  const journeyLabel = `${report.journeysCompleted} ${report.journeysCompleted === 1 ? 'Journey' : 'Journeys'}`;
  const decisionLabel =
    report.locale === 'es'
      ? `${report.decisionsAnalyzed} decisiones`
      : `${report.decisionsAnalyzed} decisions`;
  cover.drawText(`${journeyLabel}  ·  ${decisionLabel}`, {
    x: margin,
    y: 160,
    size: 11,
    font: body,
    color: rgb(0.76, 0.81, 0.73),
  });
  cover.drawText(
    `${es ? 'Profundidad' : 'Profile depth'}: ${report.profileDepth}`,
    {
      x: margin,
      y: 134,
      size: 10,
      font: body,
      color: gold,
    },
  );

  let page = pdf.addPage([width, height]);
  let y = height - margin;
  let pageNumber = 2;
  const nextPage = () => {
    footer(page, pageNumber++);
    page = pdf.addPage([width, height]);
    y = height - margin;
  };
  for (const [index, section] of report.sections.entries()) {
    if (y < 200) nextPage();
    page.drawText(
      `${String(index + 1).padStart(2, '0')}  /  ${section.title.toUpperCase()}`,
      {
        x: margin,
        y,
        size: 8,
        font: body,
        color: gold,
      },
    );
    y -= 34;
    for (const line of wrap(section.title, heading, 26, width - margin * 2)) {
      page.drawText(line, {
        x: margin,
        y,
        size: 26,
        font: heading,
        color: ink,
      });
      y -= 29;
    }
    y -= 7;
    for (const paragraph of section.paragraphs) {
      for (const line of wrap(paragraph, body, 10.5, width - margin * 2)) {
        if (y < 74) nextPage();
        page.drawText(line, {
          x: margin,
          y,
          size: 10.5,
          font: body,
          color: ink,
        });
        y -= 16;
      }
      y -= 10;
    }
    y -= 16;
  }
  if (y < 120) nextPage();
  for (const line of wrap(report.scopeNote, body, 8.5, width - margin * 2)) {
    page.drawText(line, { x: margin, y, size: 8.5, font: body, color: muted });
    y -= 13;
  }
  footer(page, pageNumber);
  return pdf.save({
    useObjectStreams: false,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}
