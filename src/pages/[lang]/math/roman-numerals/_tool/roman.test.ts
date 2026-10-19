import { describe, expect, it } from 'vitest';
import { convert, fromRoman, toRoman } from './roman';

describe('roman', () => {
  it.each([
    [1, 'I'],
    [4, 'IV'],
    [9, 'IX'],
    [14, 'XIV'],
    [40, 'XL'],
    [90, 'XC'],
    [400, 'CD'],
    [1994, 'MCMXCIV'],
    [2026, 'MMXXVI'],
    [3999, 'MMMCMXCIX'],
  ])('%d ↔ %s', (n, r) => {
    expect(toRoman(n)).toBe(r);
    expect(fromRoman(r)).toBe(n);
    expect(fromRoman(r.toLowerCase())).toBe(n);
  });

  it('всё от 1 до 3999 — туда и обратно', () => {
    for (let n = 1; n <= 3999; n++) expect(fromRoman(toRoman(n)!)).toBe(n);
  });

  it('вне диапазона и неправильная запись', () => {
    expect(toRoman(0)).toBeNull();
    expect(toRoman(4000)).toBeNull();
    for (const bad of ['IIII', 'IC', 'VX', 'MMMM', 'ABC', 'XM', '']) expect(fromRoman(bad)).toBeNull();
  });

  it('convert определяет направление', () => {
    expect(convert('2026')).toEqual({ kind: 'toRoman', value: 'MMXXVI' });
    expect(convert(' mcmxciv ')).toEqual({ kind: 'fromRoman', value: 1994 });
    expect(convert('5000')).toEqual({ kind: 'error', reason: 'range' });
    expect(convert('IIII')).toEqual({ kind: 'error', reason: 'roman' });
    expect(convert('')).toBeNull();
  });
});
