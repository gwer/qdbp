import { expect, test } from 'vitest';
import * as lib from '@cantoo/pdf-lib';
import { PDFDocument, PDFName, PDFRawStream, StandardFonts } from '@cantoo/pdf-lib';
import { deflatePlain, dropUnreachable, unpredictPng } from './compress';

test('unpredictPng: фильтры None, Sub, Up, Average, Paeth', () => {
  // Картинка 2×5 серая: строки [10,20], [30,40], [50,60], [70,80], [90,100], каждая со своим фильтром.
  const rows = [
    [0, 10, 20], // None
    [1, 30, 10], // Sub: 30, 30+10
    [2, 20, 20], // Up: 30+20, 40+20
    [3, 45, 30], // Average: 50/2+45=70, (70+60)/2+15... считаем ниже
    [4, 20, 20], // Paeth
  ];
  const out = unpredictPng(new Uint8Array(rows.flat()), 1, 2);
  // Average, строка 4: x0 = 45 + (0+50)>>1 = 70; x1 = 30 + (70+60)>>1 = 95.
  // Paeth, строка 5: x0: a=0,b=70,c=0 → p=70 → b → 90; x1: a=90,b=95,c=70 → p=115, pa=25,pb=20,pc=45 → b → 115.
  expect([...out]).toEqual([10, 20, 30, 40, 50, 60, 70, 95, 90, 115]);
});

test('deflatePlain и dropUnreachable: без потерь, текст на месте', async () => {
  const d = await PDFDocument.create();
  const font = await d.embedFont(StandardFonts.Helvetica);
  const page = d.addPage();
  page.drawText('Hello compressed world', { x: 50, y: 700, font });
  // Несжатый поток содержимого и мусорный объект, на который никто не ссылается.
  const ops = new TextEncoder().encode('0 0 m 100 100 l S\n'.repeat(200));
  const plainRef = d.context.register(PDFRawStream.of(d.context.obj({}), ops));
  page.node.addContentStream(plainRef);
  d.context.register(PDFRawStream.of(d.context.obj({}), new Uint8Array(5000)));
  const before = (await d.save({ useObjectStreams: false })).length;

  const doc = await PDFDocument.load(await d.save({ useObjectStreams: false, objectsPerTick: Infinity }));
  expect(dropUnreachable(lib, doc)).toBeGreaterThanOrEqual(1);
  expect(deflatePlain(lib, doc)).toBeGreaterThanOrEqual(1);
  const after = await doc.save();
  expect(after.length).toBeLessThan(before / 2);
  const again = await PDFDocument.load(after);
  const contents = again.getPage(0).node.Contents();
  expect(contents).toBeDefined();
  const streams = again.context.enumerateIndirectObjects().filter(([, o]) => o instanceof PDFRawStream && (o as PDFRawStream).dict.get(PDFName.of('Filter')) === PDFName.of('FlateDecode'));
  expect(streams.length).toBeGreaterThan(0);
});
