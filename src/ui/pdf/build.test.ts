import { expect, test } from 'vitest';
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, StandardFonts } from '@cantoo/pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { assemble, editPages } from './build';
import type { PdfSource } from './source';

/** Документ из n страниц с текстом «P1»… Страницы 3 и далее — в промежуточном узле дерева, их Resources и Rotate унаследованы. */
async function nested(n: number): Promise<Uint8Array> {
  const d = await PDFDocument.create();
  const font = await d.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= n; i++) d.addPage([200, 200]).drawText(`P${i}`, { x: 20, y: 100, font });
  const ctx = d.context;
  const rootRef = d.catalog.get(PDFName.of('Pages'))!;
  const root = d.catalog.Pages();
  const kids = root.lookup(PDFName.of('Kids'), PDFArray);
  const refs = kids.asArray();
  const inner = PDFDict.withContext(ctx);
  const innerRef = ctx.register(inner);
  const innerKids = PDFArray.withContext(ctx);
  const res = (ctx.lookup(refs[2]) as PDFDict).get(PDFName.of('Resources'))!;
  for (const ref of refs.slice(2)) {
    const leaf = ctx.lookup(ref) as PDFDict;
    leaf.delete(PDFName.of('Resources'));
    leaf.set(PDFName.of('Parent'), innerRef);
    innerKids.push(ref);
  }
  inner.set(PDFName.of('Type'), PDFName.of('Pages'));
  inner.set(PDFName.of('Kids'), innerKids);
  inner.set(PDFName.of('Count'), PDFNumber.of(n - 2));
  inner.set(PDFName.of('Parent'), rootRef);
  inner.set(PDFName.of('Resources'), res);
  inner.set(PDFName.of('Rotate'), PDFNumber.of(180));
  const top = PDFArray.withContext(ctx);
  refs.slice(0, 2).forEach((r) => top.push(r));
  top.push(innerRef);
  root.set(PDFName.of('Kids'), top);
  return d.save({ useObjectStreams: false });
}

/** Текст и поворот каждой страницы, как их видит pdf.js. */
async function read(blob: Blob) {
  const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()), verbosity: 0 }).promise;
  const out: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = (await page.getTextContent()).items.map((it) => ('str' in it ? it.str : '')).join('');
    out.push(`${text}@${page.rotate}`);
  }
  return out;
}

const src = (bytes: Uint8Array, id = 1) => ({ id, bytes }) as PdfSource;

test('editPages: порядок, поворот, удаление, унаследованные атрибуты', async () => {
  const bytes = await nested(4);
  expect(await read(new Blob([bytes as Uint8Array<ArrayBuffer>]))).toEqual(['P1@0', 'P2@0', 'P3@180', 'P4@180']);
  const out = await editPages(src(bytes), [
    { index: 3, rotate: 90 },
    { index: 0, rotate: 0 },
    { index: 1, rotate: 0, removed: true },
    { index: 2, rotate: -90 },
  ]);
  expect(await read(out)).toEqual(['P4@270', 'P1@0', 'P3@90']);
});

test('assemble: страницы двух файлов, повтор и поворот', async () => {
  const a = src(await nested(3), 1);
  const b = src(await nested(3), 2);
  const out = await assemble([
    { source: b, index: 1 },
    { source: a, index: 2, rotate: 90 },
    { source: a, index: 0 },
    { source: a, index: 0 },
  ]);
  expect(await read(out)).toEqual(['P2@0', 'P3@270', 'P1@0', 'P1@0']);
});
