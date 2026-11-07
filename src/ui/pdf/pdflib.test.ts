import { expect, test } from 'vitest';
import { datedName, pdfName } from './pdflib';

test('pdfName: имя исходного файла, суффикс и домен', () => {
  expect(pdfName('report.final.PDF', '_compressed')).toBe('report.final_compressed_tooloot.net.pdf');
  expect(pdfName('.pdf', '', 'txt')).toBe('document_tooloot.net.txt');
});

test('datedName: местные дата и время до секунды и домен', () => {
  expect(datedName('merged', new Date(2026, 0, 5, 9, 7, 3))).toBe('merged_2026-01-05_09-07-03_tooloot.net.pdf');
});
