import { expect, test } from 'vitest';
import { pageText } from './text';

test('pageText: строки, хвостовые пробелы, пустые строки', () => {
  const items = [
    { str: 'Hello', hasEOL: false },
    { str: ' ', hasEOL: false },
    { str: 'world  ', hasEOL: true },
    { str: '', hasEOL: true },
    { str: '', hasEOL: true },
    { str: '', hasEOL: true },
    { str: 'Second line', hasEOL: true },
  ];
  expect(pageText(items)).toBe('Hello world\n\nSecond line');
  expect(pageText([])).toBe('');
});
