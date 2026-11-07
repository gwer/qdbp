import { expect, test } from 'vitest';
import { pdfName } from './pdflib';

const now = new Date(2026, 0, 5, 9, 7, 3);

test('pdfName: суффикс, местные дата и время до секунды, домен', () => {
  expect(pdfName('report.final.PDF', '_compressed', 'pdf', now)).toBe('report.final_compressed_2026-01-05_09-07-03_tooloot.net.pdf');
  expect(pdfName('merged', '', 'pdf', now)).toBe('merged_2026-01-05_09-07-03_tooloot.net.pdf');
  expect(pdfName('.pdf', '', 'txt', now)).toBe('document_2026-01-05_09-07-03_tooloot.net.txt');
});
