import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { ReportData } from '../src/reports/data.js';

export async function renderReportPdf(
  report: ReportData,
  assets: {
    bodyFont: Uint8Array;
    headingFont: Uint8Array;
    landscape: Uint8Array;
    nameImage?: Uint8Array;
  },
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const body = await pdf.embedFont(assets.bodyFont, { subset: true });
  const heading = await pdf.embedFont(assets.headingFont, { subset: true });
  const photo = await pdf.embedPng(assets.landscape);
  const green = rgb(0.063, 0.114, 0.094),
    gold = rgb(0.72, 0.63, 0.43),
    ink = rgb(0.13, 0.19, 0.15),
    muted = rgb(0.37, 0.43, 0.35);
  const width = 595.28,
    height = 841.89,
    margin = 52;
  const wrap = (
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ) => {
    const lines: string[] = [];
    let line = '';
    for (const word of text.replaceAll('\n', ' ').split(/\s+/)) {
      if (
        font.widthOfTextAtSize(line ? `${line} ${word}` : word, size) <=
        maxWidth
      ) {
        line = line ? `${line} ${word}` : word;
      } else {
        if (line) lines.push(line);
        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          let piece = '';
          for (const char of word) {
            if (font.widthOfTextAtSize(piece + char, size) > maxWidth) {
              lines.push(piece);
              piece = '';
            }
            piece += char;
          }
          line = piece;
        } else line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  };
  const footer = (page: PDFPage, index: number) => {
    page.drawLine({
      start: { x: margin, y: 44 },
      end: { x: width - margin, y: 44 },
      color: rgb(0.83, 0.86, 0.81),
      thickness: 0.5,
    });
    page.drawText('ARCHETYPE  /  THE UNWRITTEN ROAD', {
      x: margin,
      y: 28,
      size: 7,
      font: body,
      color: muted,
    });
    page.drawText(String(index), {
      x: width - margin - 7,
      y: 28,
      size: 8,
      font: body,
      color: muted,
    });
  };
  const cover = pdf.addPage([width, height]);
  cover.drawRectangle({ x: 0, y: 0, width, height, color: green });
  const ph = (photo.height / photo.width) * width;
  cover.drawImage(photo, { x: 0, y: height - ph, width, height: ph });
  cover.drawRectangle({ x: 0, y: 0, width, height: 435, color: green });
  cover.drawText('ARCHETYPE', {
    x: margin,
    y: height - 45,
    size: 15,
    font: heading,
    color: rgb(0.96, 0.96, 0.9),
  });
  cover.drawText('YOUR PERSONAL JOURNEY', {
    x: margin,
    y: 385,
    size: 9,
    font: body,
    color: gold,
  });
  let y = 343;
  for (const line of wrap(
    report.cover.character_title,
    heading,
    45,
    width - margin * 2,
  )) {
    cover.drawText(line, {
      x: margin,
      y,
      size: 45,
      font: heading,
      color: rgb(0.95, 0.95, 0.89),
    });
    y -= 49;
  }
  y -= 18;
  const named = report.cover.user_name ?? 'A story entirely your own';
  if (assets.nameImage) {
    const name = await pdf.embedPng(assets.nameImage);
    const scale = Math.min(1 / 3, (width - margin * 2) / name.width);
    cover.drawImage(name, {
      x: margin,
      y: y - name.height * scale + 12,
      width: name.width * scale,
      height: name.height * scale,
    });
  } else {
    for (const char of named) {
      if (!body.getCharacterSet().includes(char.codePointAt(0)!))
        throw new Error(
          'Please supply a rendered name image for text outside the embedded font.',
        );
    }
    for (const line of wrap(named, body, 12, width - margin * 2)) {
      cover.drawText(line, {
        x: margin,
        y,
        size: 12,
        font: body,
        color: rgb(0.77, 0.82, 0.73),
      });
      y -= 18;
    }
  }
  cover.drawText(
    new Date(report.cover.date).toLocaleDateString('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    { x: margin, y: 112, size: 10, font: body, color: gold },
  );
  cover.drawText('15 moments. Twelve archetypes. Your individual blend.', {
    x: margin,
    y: 86,
    size: 10,
    font: body,
    color: rgb(0.72, 0.78, 0.68),
  });
  let page = pdf.addPage([width, height]);
  y = height - margin;
  let pageIndex = 2;
  const newPage = () => {
    footer(page, pageIndex++);
    page = pdf.addPage([width, height]);
    y = height - margin;
  };
  for (const section of report.sections) {
    if (y < 210) newPage();
    page.drawText(`CHAPTER ${String(section.number).padStart(2, '0')}`, {
      x: margin,
      y,
      size: 8,
      font: body,
      color: gold,
    });
    y -= 30;
    const titleLines = wrap(section.title, heading, 29, width - margin * 2);
    for (const line of titleLines) {
      page.drawText(line, {
        x: margin,
        y,
        size: 29,
        font: heading,
        color: ink,
      });
      y -= 31;
    }
    y -= 9;
    for (const paragraph of section.paragraphs) {
      const lines = wrap(paragraph, body, 10.5, width - margin * 2);
      for (const line of lines) {
        if (y < 76) newPage();
        page.drawText(line, {
          x: margin,
          y,
          size: 10.5,
          font: body,
          color: ink,
        });
        y -= 17;
      }
      y -= 12;
    }
    y -= 20;
  }
  if (y < 140) newPage();
  y -= 10;
  for (const line of wrap(report.disclaimer, body, 9, width - margin * 2)) {
    page.drawText(line, { x: margin, y, size: 9, font: body, color: muted });
    y -= 15;
  }
  footer(page, pageIndex);
  pdf.setTitle(report.cover.character_title);
  pdf.setAuthor('Archetype');
  pdf.setSubject('A personal narrative reflection');
  return pdf.save();
}
