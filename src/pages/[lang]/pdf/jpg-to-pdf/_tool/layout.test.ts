import { expect, test } from 'vitest';
import { exifRotation, place } from './layout';

const round = (p: ReturnType<typeof place>) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, Math.round(v * 100) / 100]));

test('A4, авто: горизонтальное фото — альбомная страница, вписано по ширине', () => {
  expect(round(place(4000, 3000, 0, { size: 'a4', orientation: 'auto', margin: 'none' }))).toEqual({
    pageW: 841.89,
    pageH: 595.28,
    // 841.89 / 4000 = 0.21047 < 595.28 / 3000 = 0.19843 → вписано по высоте
    width: 793.71,
    height: 595.28,
    x: 24.09,
    y: 0,
    rotate: 0,
  });
});

test('A4, книжная, поля 10 мм: масштаб по меньшей стороне', () => {
  const p = place(1000, 1000, 0, { size: 'a4', orientation: 'portrait', margin: 'small' });
  expect(p.pageW).toBe(595.28);
  expect(p.width).toBeCloseTo(595.28 - 2 * 28.35, 2);
  expect(p.y).toBeCloseTo((841.89 - p.height) / 2, 6);
});

test('фото с EXIF-поворотом 90°: страница записана повёрнутой, показ — книжный', () => {
  // Записано 4000×3000, на экране — 3000×4000 (портрет).
  const p = place(4000, 3000, 90, { size: 'a4', orientation: 'auto', margin: 'none' });
  expect(p.rotate).toBe(90);
  // Показ портретный → до поворота страница альбомная.
  expect([p.pageW, p.pageH]).toEqual([841.89, 595.28]);
  expect(p.width / p.height).toBeCloseTo(4000 / 3000, 6);
});

test('по размеру фото: 96 dpi, поворот меняет стороны страницы', () => {
  expect(place(800, 600, 0, { size: 'fit', orientation: 'auto', margin: 'none' })).toMatchObject({ pageW: 600, pageH: 450, width: 600, height: 450, x: 0, y: 0 });
  expect(place(800, 600, 270, { size: 'fit', orientation: 'auto', margin: 'none' })).toMatchObject({ pageW: 600, pageH: 450, rotate: 270 });
  expect(place(800, 600, -90, { size: 'fit', orientation: 'auto', margin: 'none' }).rotate).toBe(270);
});

test('exifRotation', () => {
  expect([undefined, 1, 3, 6, 8, 2, 5].map(exifRotation)).toEqual([0, 0, 180, 90, 270, null, null]);
});
