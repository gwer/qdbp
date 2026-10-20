import { describe, expect, it } from 'vitest';
import { listItems, randomInt, shuffle, splitIntoGroups } from './random';

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

describe('random', () => {
  it('randomInt равномерно', () => {
    const r = seeded(1);
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 60000; i++) counts[randomInt(6, r)]++;
    for (const c of counts) expect(Math.abs(c - 10000)).toBeLessThan(400);
  });

  it('shuffle — перестановка, каждая позиция равновероятна', () => {
    const r = seeded(2);
    const firsts = { a: 0, b: 0, c: 0 } as Record<string, number>;
    for (let i = 0; i < 30000; i++) {
      const s = shuffle(['a', 'b', 'c'], r);
      expect([...s].sort()).toEqual(['a', 'b', 'c']);
      firsts[s[0]]++;
    }
    for (const v of Object.values(firsts)) expect(Math.abs(v - 10000)).toBeLessThan(400);
  });

  it('группы ровные', () => {
    const groups = splitIntoGroups([1, 2, 3, 4, 5, 6, 7], 3, seeded(3));
    expect(groups.map((g) => g.length).sort()).toEqual([2, 2, 3]);
    expect(groups.flat().sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('список из текста', () => {
    expect(listItems(' Аня \n\nБорис\r\n  \nВика')).toEqual(['Аня', 'Борис', 'Вика']);
  });
});
