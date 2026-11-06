import { expect, test } from 'vitest';
import { degrees, PDFDocument } from '@cantoo/pdf-lib';
import { getDocument, Util } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { drawLabel, pageBox, shownSize, toUser } from './stamp';

test('toUser: углы видимой страницы при каждом повороте', () => {
  // Страница 100×200 со смещением CropBox (10, 20).
  const box = (rotate: number) => ({ x: 10, y: 20, w: 100, h: 200, rotate });
  // Левый нижний угол видимой страницы.
  expect(toUser(box(0), 0, 0)).toEqual([10, 20]);
  expect(toUser(box(90), 0, 0)).toEqual([110, 20]);
  expect(toUser(box(180), 0, 0)).toEqual([110, 220]);
  expect(toUser(box(270), 0, 0)).toEqual([10, 220]);
  // Правый верхний угол видимой страницы (при 90° видна как 200×100).
  expect(toUser(box(90), 200, 100)).toEqual([10, 220]);
});

test('drawLabel: надпись внизу по центру стоит прямо на страницах с любым поворотом', async () => {
  const doc = await PDFDocument.create();
  for (const r of [0, 90, 180, 270]) doc.addPage([400, 600]).setRotation(degrees(r));
  for (const page of doc.getPages()) {
    const { width } = shownSize(pageBox(page));
    await drawLabel(doc, page, { text: 'Page 7', size: 20, color: [0, 0, 0], x: width / 2, y: 30, align: 'center', valign: 'baseline' });
  }
  const pdf = await getDocument({ data: await doc.save(), verbosity: 0 }).promise;
  for (let i = 1; i <= 4; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    const item = (await page.getTextContent()).items.find((it) => 'str' in it && it.str === 'Page 7') as { transform: number[]; width: number };
    // Матрица текста на экране: без поворота (a > 0, b ≈ 0), а базовая линия — в 30 пт от низа и по центру.
    const m = Util.transform(vp.transform, item.transform);
    expect(m[0]).toBeGreaterThan(0);
    expect(Math.abs(m[1])).toBeLessThan(1e-6);
    expect(m[5]).toBeCloseTo(vp.height - 30, 3);
    expect(m[4] + item.width / 2).toBeCloseTo(vp.width / 2, 0);
  }
});

test('isWinAnsi', async () => {
  const { isWinAnsi } = await import('./stamp');
  expect(isWinAnsi('Página 3 de 10 – Seite 3 von 10 €')).toBe(true);
  expect(isWinAnsi('Страница 3')).toBe(false);
  expect(isWinAnsi('3 → 4')).toBe(false);
});
