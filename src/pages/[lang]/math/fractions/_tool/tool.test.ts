import { describe, expect, it } from 'vitest';
import { fractions, steps } from './tool';

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

describe('смешанные числа', () => {
  it('1 1/2 + 2 1/3 = 23/6 = 3 5/6; −1 1/2 × 2 = −3', () => {
    expect(fractions(1, 2, 'add', 1, 3, 1, 2)).toMatchObject({ fraction: '23/6', mixed: '3 5/6' });
    expect(fractions(1, 2, 'multiply', 2, 1, -1, 0).fraction).toBe('−3');
  });
});

describe('ход решения', () => {
  it('сложение: общий знаменатель по НОК, сокращение', () => {
    expect(steps(0n, 1n, 4n, 'add', 0n, 1n, 6n).map((s) => [s.key, s.params])).toEqual([
      ['common', { l: '12', expr: '3/12 + 2/12' }],
      ['combine', { expr: '3 + 2 = 5', result: '5/12' }],
    ]);
    expect(steps(0n, 1n, 4n, 'add', 0n, 1n, 4n).map((s) => s.key)).toEqual(['combine', 'reduce']);
  });

  it('деление через перевёрнутую дробь, знак — в числитель', () => {
    const s = steps(0n, 3n, 4n, 'divide', 0n, -1n, 8n);
    expect(s[0]).toEqual({ key: 'divide', params: { expr: '3/4 × −8/1' } });
    expect(s.at(-1)).toEqual({ key: 'reduce', params: { g: '4', result: '−6' } });
  });
});
