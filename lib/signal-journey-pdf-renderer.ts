import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  signalJourneyReportSchema,
  type SignalJourneyReportData,
} from '../src/domain/results/contracts.js';

export async function renderSignalJourneyReportPdf(
  input: SignalJourneyReportData,
  assets: { bodyFont: Uint8Array; headingFont: Uint8Array },
) {
  const report = signalJourneyReportSchema.parse(input);
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
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
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
    page.drawText(`QUESTYPE  /  ${report.title.toUpperCase()}`, {
      x: margin,
      y: 28,
      size: 7,
      font: body,
      color: muted,
      maxWidth: width - margin * 2 - 30,
    });
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
  cover.drawText(es ? 'INFORME DEL JOURNEY' : 'JOURNEY REPORT', {
    x: margin,
    y: 570,
    size: 10,
    font: body,
    color: gold,
  });
  let coverY = 520;
  for (const line of wrap(report.title, heading, 42, width - margin * 2)) {
    cover.drawText(line, {
      x: margin,
      y: coverY,
      size: 42,
      font: heading,
      color: rgb(0.95, 0.95, 0.89),
    });
    coverY -= 48;
  }
  for (const line of wrap(
    report.assessmentFocus,
    body,
    14,
    width - margin * 2,
  )) {
    cover.drawText(line, {
      x: margin,
      y: coverY - 12,
      size: 14,
      font: body,
      color: gold,
    });
    coverY -= 21;
  }
  cover.drawText(
    `${report.decisionsAnalyzed} ${es ? 'decisiones analizadas' : 'decisions analyzed'}`,
    { x: margin, y: 145, size: 11, font: body, color: rgb(0.76, 0.81, 0.73) },
  );
  cover.drawText(`v${report.journeyVersion}  ·  ${report.signalModelId}`, {
    x: margin,
    y: 120,
    size: 8,
    font: body,
    color: rgb(0.6, 0.68, 0.59),
  });

  let page = pdf.addPage([width, height]);
  let y = height - margin;
  let pageNumber = 2;
  const nextPage = () => {
    footer(page, pageNumber++);
    page = pdf.addPage([width, height]);
    y = height - margin;
  };
  for (const [index, section] of report.sections.entries()) {
    if (y < 190) nextPage();
    page.drawText(
      `${String(index + 1).padStart(2, '0')}  /  ${section.title.toUpperCase()}`,
      { x: margin, y, size: 8, font: body, color: gold },
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
