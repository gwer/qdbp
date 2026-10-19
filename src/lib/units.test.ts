import { describe, expect, it } from 'vitest';
import { convert, displayUnit, forField, parseFeetInches, tidy, unitSymbol } from './units';

describe('convert', () => {
  it.each([
    [1, 'ft', 'm', 0.3048],
    [12, 'in', 'ft', 1],
    [1, 'gal', 'l', 3.785411784],
    [1, 'yd3', 'm3', 0.764554857984],
    [1, 'm2', 'ft2', 10.763910416709722],
    [1, 'lb', 'kg', 0.45359237],
    [100, 'cm', 'm', 1],
    [10, 'm2_per_l', 'ft2_per_gal', 407.45833333333337],
  ] as const)('%d %s → %s', (v, from, to, expected) => {
    expect(convert(v, from, to)).toBeCloseTo(expected, 4);
  });

  it('туда и обратно без потерь', () => {
    expect(convert(convert(4.2, 'm', 'ft'), 'ft', 'm')).toBeCloseTo(4.2, 12);
  });

  it('разные измерения — ошибка', () => {
    expect(() => convert(1, 'm', 'kg')).toThrow();
  });
});

describe('displayUnit, tidy, unitSymbol', () => {
  it('единица по системе', () => {
    expect(displayUnit({ unit: 'm', imperial: 'ft' }, 'imperial')).toBe('ft');
    expect(displayUnit({ unit: 'm', imperial: 'ft' }, 'metric')).toBe('m');
    expect(displayUnit({ unit: 'cm' }, 'imperial')).toBe('cm');
  });

  it('tidy и forField убирают хвосты', () => {
    expect(tidy(convert(4, 'm', 'ft'))).toBe(13.1234);
    expect(forField(convert(160, 'lb', 'kg'))).toBe(72.57);
    expect(forField(convert(3, 'mm', 'in'))).toBe(0.12);
    expect(forField(convert(1, 'mm', 'in'))).toBe(0.039);
  });

  it('обозначения по языку', () => {
    expect(unitSymbol('ru', 'm2')).toBe('м²');
    expect(unitSymbol('en', 'ft2')).toBe('sq ft');
    expect(unitSymbol('de', 'ft2')).toBe('ft²');
    expect(unitSymbol('en', 'l')).toBe('L');
    expect(unitSymbol('es', 'l')).toBe('l');
  });
});

describe('parseFeetInches', () => {
  it.each([
    ["5'10\"", 70],
    ["5' 10", 70],
    ['6ft 2in', 74],
    ["5'", 60],
    ["5'7.5\"", 67.5],
  ])('«%s» → %d', (input, expected) => {
    expect(parseFeetInches(input)).toBe(expected);
  });

  it.each(['70', "5'13", 'abc', ''])('«%s» — не футы', (input) => {
    expect(parseFeetInches(input)).toBeNull();
  });
});
