import { describe, expect, it } from 'vitest';
import { fractions } from './tool';

// Эталоны — Python fractions.Fraction.
describe('fractions', () => {
  it.each([
    [1, 2, 'add', 1, 3, '5/6', '5/6', 5 / 6],
    [1, 2, 'subtract', 2, 3, '−1/6', '−1/6', -1 / 6],
    [3, 4, 'multiply', 2, 9, '1/6', '1/6', 1 / 6],
    [3, 4, 'divide', 1, 8, '6', '6', 6],
    [7, 4, 'add', 1, 2, '9/4', '2 1/4', 2.25],
    [-5, 3, 'add', 0, 1, '−5/3', '−1 2/3', -5 / 3],
    [2, 4, 'add', 2, 4, '1', '1', 1],
    // Произведения больше 2^53 до сокращения
    [100000000, 100000001, 'subtract', 100000017, 100000018, '−1/588235405882354', '−1/588235405882354', -1 / 588235405882354],
    [99999989, 99999990, 'multiply', 99999990, 99999989, '1', '1', 1],
  ] as const)('%d/%d %s %d/%d = %s', (n1, d1, op, n2, d2, fraction, mixed, decimal) => {
    const r = fractions(n1, d1, op, n2, d2);
    expect(r.fraction).toBe(fraction);
    expect(r.mixed).toBe(mixed);
    expect(r.decimal).toBeCloseTo(decimal, 12);
  });

  it('деление на ноль', () => {
    expect(() => fractions(1, 2, 'divide', 0, 5)).toThrow();
  });
});
