import { describe, expect, it } from 'vitest';
import { parseNumber } from './parse';

describe('parseNumber', () => {
  it.each([
    ['42', 42],
    ['-0,5', -0.5],
    ['1 234,5', 1234.5],
    ['1 234,5', 1234.5],
    ['1.234,5', 1234.5],
    ['1,234.5', 1234.5],
    ['1,234,567', 1234567],
    ['1.234.567', 1234567],
    ['.5', 0.5],
    ['  12  ', 12],
    ['−3', -3],
    ['-1.234.567,89', -1234567.89],
  ])('ru: «%s» → %d', (input, expected) => {
    expect(parseNumber(input, 'ru')).toBe(expected);
  });

  it('одиночный разделитель зависит от языка', () => {
    expect(parseNumber('1,234', 'en')).toBe(1234);
    expect(parseNumber('1,5', 'en')).toBe(1.5);
    expect(parseNumber('1.500', 'de')).toBe(1500);
    expect(parseNumber('1.5', 'de')).toBe(1.5);
    expect(parseNumber('1.500', 'ru')).toBe(1.5);
    expect(parseNumber('1,500', 'ru')).toBe(1.5);
  });

  it.each(['', '-', 'abc', '1,2,3.4.5', '12a', '1e5', '--1', '1.2.3', '1,23,4', '12,34.5', '1.23,4', '1234.567.890'])('«%s» — не число', (input) => {
    expect(parseNumber(input, 'ru')).toBeNull();
  });
});
