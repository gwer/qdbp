import { describe, expect, test } from 'vitest';
import { expand, formatPages, parseRanges } from './ranges';

describe('parseRanges', () => {
  test('одиночные страницы, диапазоны и открытые концы', () => {
    expect(parseRanges('1-3, 5, 8-', 10)).toEqual({ ok: true, ranges: [[1, 3], [5, 5], [8, 10]] });
    expect(parseRanges('-2; 9', 10)).toEqual({ ok: true, ranges: [[1, 2], [9, 9]] });
    expect(parseRanges(' 2 – 4 ,6—7, 1−1 ', 10)).toEqual({ ok: true, ranges: [[2, 4], [6, 7], [1, 1]] });
  });
  test('обратный порядок разрешён', () => {
    expect(parseRanges('5-3', 5)).toEqual({ ok: true, ranges: [[5, 3]] });
  });
  test('ошибки', () => {
    expect(parseRanges('', 5)).toEqual({ ok: false, error: 'empty' });
    expect(parseRanges(' , ', 5)).toEqual({ ok: false, error: 'empty' });
    expect(parseRanges('1-3, x', 5)).toEqual({ ok: false, error: 'syntax', token: 'x' });
    expect(parseRanges('-', 5)).toEqual({ ok: false, error: 'syntax', token: '-' });
    expect(parseRanges('1.5', 5)).toEqual({ ok: false, error: 'syntax', token: '1.5' });
    expect(parseRanges('0', 5)).toEqual({ ok: false, error: 'outOfRange', token: '0' });
    expect(parseRanges('4-6', 5)).toEqual({ ok: false, error: 'outOfRange', token: '4-6' });
    expect(parseRanges('6-', 5)).toEqual({ ok: false, error: 'outOfRange', token: '6-' });
  });
});

test('expand', () => {
  expect(expand([2, 4])).toEqual([2, 3, 4]);
  expect(expand([3, 1])).toEqual([3, 2, 1]);
  expect(expand([7, 7])).toEqual([7]);
});

test('formatPages', () => {
  expect(formatPages([1, 2, 3, 5, 7, 8])).toEqual('1-3, 5, 7-8');
  expect(formatPages([4])).toEqual('4');
  expect(formatPages([])).toEqual('');
});
