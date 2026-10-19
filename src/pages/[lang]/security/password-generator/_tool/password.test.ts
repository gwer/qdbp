import { describe, expect, it } from 'vitest';
import { entropyBits, generate, randomInt, SETS, strength } from './password';

// Детерминированный генератор (xorshift32) — для воспроизводимых тестов.
function seeded(seed: number) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>>= 0);
  };
}

describe('randomInt', () => {
  it('в диапазоне и без заметного смещения', () => {
    const r = seeded(42);
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 60000; i++) counts[randomInt(6, r)]++;
    for (const c of counts) expect(Math.abs(c - 10000)).toBeLessThan(400);
  });

  it('отбрасывает значения из «хвоста»', () => {
    // max = 3: limit = 4294967295 → значение 4294967295 должно быть отброшено.
    const values = [4294967295, 7];
    expect(randomInt(3, () => values.shift()!)).toBe(1);
  });
});

describe('generate', () => {
  it('длина и наборы символов', () => {
    const r = seeded(7);
    for (let i = 0; i < 200; i++) {
      const p = generate({ length: 12, sets: ['lower', 'upper', 'digits', 'symbols'], noSimilar: false }, r);
      expect(p).toHaveLength(12);
      for (const set of Object.values(SETS)) expect([...p].some((c) => set.includes(c))).toBe(true);
    }
  });

  it('без похожих символов', () => {
    const r = seeded(9);
    for (let i = 0; i < 200; i++) {
      expect(generate({ length: 30, sets: ['lower', 'upper', 'digits'], noSimilar: true }, r)).not.toMatch(/[Il1O0o]/);
    }
  });

  it('ошибка, если наборов нет или длина меньше их числа', () => {
    expect(() => generate({ length: 10, sets: [], noSimilar: false })).toThrow();
    expect(() => generate({ length: 2, sets: ['lower', 'upper', 'digits'], noSimilar: false })).toThrow();
  });
});

describe('энтропия', () => {
  it('16 символов из 62 ≈ 95 бит', () => {
    expect(entropyBits({ length: 16, sets: ['lower', 'upper', 'digits'], noSimilar: false })).toBeCloseTo(16 * Math.log2(62), 6);
    expect(strength(95)).toBe('veryStrong');
    expect(strength(30)).toBe('weak');
  });
});
