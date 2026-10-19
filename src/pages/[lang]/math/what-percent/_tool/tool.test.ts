import { describe, expect, it } from 'vitest';
import { whatPercent } from './tool';

describe('whatPercent', () => {
  it.each([
    [30, 150, 20],
    [1, 3, 33.333333333333336],
    [45, 60, 75],
    [250, 200, 125],
    [0, 7, 0],
    [7.5, 30, 25],
  ])('%d от %d = %d%%', (part, whole, expected) => {
    expect(whatPercent(part, whole).percent).toBeCloseTo(expected, 10);
  });

  it('деление на ноль — ошибка', () => {
    expect(() => whatPercent(5, 0)).toThrow();
  });
});
