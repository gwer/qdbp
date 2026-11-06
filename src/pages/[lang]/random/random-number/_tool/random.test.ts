import { describe, expect, it } from 'vitest';
import { draw, randomInt, type Uint32Source } from './random';

const sequence = (...xs: number[]): Uint32Source => {
  let i = 0;
  return () => xs[i++ % xs.length];
};

describe('randomInt', () => {
  it('отбрасывает значения из «хвоста» (без смещения)', () => {
    // size = 3: limit = 2^32 − (2^32 mod 3) = 4294967295; значение 4294967295 отбрасывается.
    expect(randomInt(1, 3, sequence(4294967295, 4))).toBe(1 + (4 % 3));
  });

  it('границы диапазона достижимы', () => {
    expect(randomInt(1, 6, sequence(0))).toBe(1);
    expect(randomInt(1, 6, sequence(5))).toBe(6);
    expect(randomInt(-10, -10, sequence(123))).toBe(-10);
  });

  it('большие диапазоны (больше 2^32)', () => {
    const x = randomInt(0, 2 ** 40, sequence(0xffffffff, 0xffffffff, 7, 9));
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(2 ** 40);
  });

  it('некорректный диапазон', () => {
    expect(() => randomInt(5, 4)).toThrow();
    expect(() => randomInt(0.5, 4)).toThrow();
  });

  it('распределение равномерное (χ², crypto)', () => {
    const n = 60_000;
    const counts = Array(6).fill(0);
    for (let i = 0; i < n; i++) counts[randomInt(1, 6) - 1]++;
    const expected = n / 6;
    const chi2 = counts.reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
    // 5 степеней свободы: χ² > 20.5 с вероятностью 0.1%.
    expect(chi2).toBeLessThan(20.5);
  });
});

describe('draw', () => {
  it('без повторов — все значения разные и в диапазоне', () => {
    for (const [min, max, count] of [[1, 10, 10], [1, 100, 7], [1, 1_000_000, 50]]) {
      const xs = draw({ min, max, count, unique: true });
      expect(new Set(xs).size).toBe(count);
      for (const x of xs) expect(x >= min && x <= max).toBe(true);
    }
  });

  it('без повторов больше, чем чисел в диапазоне, — ошибка', () => {
    expect(() => draw({ min: 1, max: 5, count: 6, unique: true })).toThrow();
  });

  it('с повторами — нужное количество', () => {
    expect(draw({ min: 1, max: 2, count: 20, unique: false })).toHaveLength(20);
  });
});
