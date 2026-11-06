import { expect, test } from 'vitest';
import { anchor, numberText } from './numbers';

const words = (k: 'page' | 'pageOf', n: number, total: number) => (k === 'page' ? `Page ${n}` : `Page ${n} of ${total}`);

test('numberText', () => {
  expect(numberText('n', 3, 10, words)).toBe('3');
  expect(numberText('nOfTotal', 3, 10, words)).toBe('3 / 10');
  expect(numberText('dash', 3, 10, words)).toBe('– 3 –');
  expect(numberText('pageOf', 3, 10, words)).toBe('Page 3 of 10');
});

test('anchor', () => {
  expect(anchor('bc', 600, 800, 30, 10)).toEqual({ x: 300, y: 30, align: 'center' });
  expect(anchor('tr', 600, 800, 30, 10)).toEqual({ x: 570, y: 800 - 30 - 7.2, align: 'right' });
  expect(anchor('bl', 600, 800, 30, 10)).toEqual({ x: 30, y: 30, align: 'left' });
});
