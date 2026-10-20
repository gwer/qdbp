import { describe, expect, it } from 'vitest';
import { lorem } from './lorem';

/** Детерминированный генератор для тестов (LCG). */
const seeded = (seed: number) => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);

describe('lorem', () => {
  it('абзацы: нужное число, первый начинается с классики', () => {
    const p = lorem(3, 'paragraphs', true, seeded(1));
    expect(p).toHaveLength(3);
    expect(p[0]).toMatch(/^Lorem ipsum dolor sit amet, consectetur adipiscing elit\. [A-Z]/);
    expect(p[1]).not.toMatch(/^Lorem ipsum dolor/);
    for (const para of p) expect(para).toMatch(/\.$/);
  });

  it('предложения — один абзац с нужным числом точек', () => {
    const [s] = lorem(5, 'sentences', false, seeded(2));
    expect(s.match(/\./g)).toHaveLength(5);
  });

  it('слова: ровно столько слов', () => {
    const [w] = lorem(12, 'words', true, seeded(3));
    expect(w.split(' ')).toHaveLength(12);
    expect(w).toMatch(/^Lorem ipsum dolor sit amet consectetur adipiscing elit /);
    expect(lorem(3, 'words', true, seeded(3))).toEqual(['Lorem ipsum dolor.']);
  });

  it('ноль — пусто', () => {
    expect(lorem(0, 'words', true)).toEqual([]);
    expect(lorem(0, 'sentences', true)).toEqual([]);
    expect(lorem(0, 'paragraphs', true)).toEqual([]);
  });
});
