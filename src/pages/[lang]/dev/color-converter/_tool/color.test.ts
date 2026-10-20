import { describe, expect, it } from 'vitest';
import { contrast, oklchToRgb, parseColor, rgbToCmyk, rgbToHsl, rgbToHsv, rgbToOklch, toHex } from './color';

const c = (s: string) => parseColor(s)!;

describe('разбор', () => {
  it.each([
    ['#3451d1', { r: 52, g: 81, b: 209, a: 1 }],
    ['3451D1', { r: 52, g: 81, b: 209, a: 1 }],
    ['#f00', { r: 255, g: 0, b: 0, a: 1 }],
    ['#ff000080', { r: 255, g: 0, b: 0, a: 128 / 255 }],
    ['rgb(52, 81, 209)', { r: 52, g: 81, b: 209, a: 1 }],
    ['rgb(52 81 209 / 50%)', { r: 52, g: 81, b: 209, a: 0.5 }],
    ['hsl(0 100% 50%)', { r: 255, g: 0, b: 0, a: 1 }],
    ['hsla(120, 100%, 25%, 0.3)', { r: 0, g: 128, b: 0, a: 0.3 }],
  ])('%s', (input, expected) => {
    expect(c(input)).toEqual(expected);
  });

  it.each(['', 'blue-ish', '#12345', 'rgb(1,2)', 'hsl(a b c)'])('«%s» — не цвет', (input) => {
    expect(parseColor(input)).toBeNull();
  });
});

describe('преобразования (эталоны — Python colorsys)', () => {
  it('HSL и HSV', () => {
    const h = rgbToHsl(c('#3451d1'));
    expect([h.h, h.s, h.l].map((x) => +x.toFixed(2))).toEqual([228.92, 63.05, 51.18]);
    const v = rgbToHsv(c('#3451d1'));
    expect([v.h, v.s, v.v].map((x) => +x.toFixed(2))).toEqual([228.92, 75.12, 81.96]);
  });

  it('CMYK', () => {
    expect(rgbToCmyk(c('#ff0000'))).toEqual({ c: 0, m: 100, y: 100, k: 0 });
    expect(rgbToCmyk(c('#000'))).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it('OKLCH (CSS Color 4: red = oklch(62.8% 0.2577 29.23))', () => {
    const o = rgbToOklch(c('#ff0000'));
    expect(o.l).toBeCloseTo(0.628, 3);
    expect(o.c).toBeCloseTo(0.2577, 3);
    expect(o.h).toBeCloseTo(29.23, 1);
    expect(rgbToOklch(c('#fff')).l).toBeCloseTo(1, 4);
    expect(oklchToRgb(0.62796, 0.25768, 29.2339)).toEqual({ r: 255, g: 0, b: 0 });
    expect(c('oklch(62.8% 0.2577 29.23)')).toMatchObject({ r: 255, g: 0, b: 0 });
  });

  it('контраст WCAG', () => {
    expect(contrast(c('#000'), c('#fff'))).toBeCloseTo(21, 6);
    expect(contrast(c('#777777'), c('#fff'))).toBeCloseTo(4.478, 3);
    expect(contrast(c('#3451d1'), c('#fff'))).toBeCloseTo(6.474, 3);
  });

  it('HEX обратно', () => {
    expect(toHex(c('rgb(52 81 209)'))).toBe('#3451d1');
    expect(toHex(c('rgb(255 0 0 / 50%)'))).toBe('#ff000080');
  });
});
