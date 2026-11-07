import { expect, test } from 'vitest';
import { pdfName, stampedName } from './pdflib';

test('stampedName: местные дата и время до секунды и домен', () => {
  expect(stampedName('merged', new Date(2026, 0, 5, 9, 7, 3))).toBe('merged_2026-01-05_09-07-03_tooloot.net.pdf');
});

test('pdfName: суффикс вместо расширения', () => {
  expect(pdfName('report.final.PDF', '_compressed')).toBe('report.final_compressed.pdf');
  expect(pdfName('.pdf')).toBe('document.pdf');
});
