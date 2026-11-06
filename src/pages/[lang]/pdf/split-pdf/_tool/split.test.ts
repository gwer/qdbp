import { expect, test } from 'vitest';
import { byRanges, everyN, partName } from './split';

test('everyN', () => {
  expect(everyN(5, 2)).toEqual([[1, 2], [3, 4], [5]]);
  expect(everyN(3, 1)).toEqual([[1], [2], [3]]);
  expect(everyN(3, 10)).toEqual([[1, 2, 3]]);
});

test('byRanges', () => {
  expect(byRanges('1-2, 3-', 5)).toEqual({ ok: true, groups: [[1, 2], [3, 4, 5]] });
  expect(byRanges('2-1', 5)).toEqual({ ok: true, groups: [[2, 1]] });
  expect(byRanges('1-9', 5)).toEqual({ ok: false, error: 'outOfRange', token: '1-9' });
});

test('partName', () => {
  expect(partName('report', [1, 2, 3])).toBe('report_1-3.pdf');
  expect(partName('report', [5])).toBe('report_5.pdf');
  expect(partName('report', [1, 2, 7])).toBe('report_1-2_7.pdf');
  expect(partName('report', [3, 2, 1])).toBe('report_3-1.pdf');
});
