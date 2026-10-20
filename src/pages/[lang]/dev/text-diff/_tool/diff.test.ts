import { describe, expect, it } from 'vitest';
import { diff, diffTexts, diffWords, type Op } from './diff';

/** Эталон: длина наибольшей общей подпоследовательности классическим ДП O(nm). */
function lcsLength<T>(a: T[], b: T[]): number {
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = [0];
    for (let j = 1; j <= b.length; j++) cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    prev = cur;
  }
  return prev[b.length];
}

/** Восстанавливает обе последовательности по сценарию и проверяет, что общие элементы равны. */
function apply<T>(a: T[], b: T[], ops: Op[]) {
  const ra: T[] = [];
  const rb: T[] = [];
  let i = 0;
  let j = 0;
  for (const op of ops) {
    if (op === 'e') {
      expect(a[i]).toBe(b[j]);
      ra.push(a[i++]);
      rb.push(b[j++]);
    } else if (op === 'd') ra.push(a[i++]);
    else rb.push(b[j++]);
  }
  return [ra, rb];
}

let seed = 42;
const rand = (n: number) => {
  seed = (seed * 1103515245 + 12345) % 2 ** 31;
  return seed % n;
};

describe('diff', () => {
  it('edge cases', () => {
    expect(diff([], [])).toEqual([]);
    expect(diff(['a'], [])).toEqual(['d']);
    expect(diff([], ['a', 'b'])).toEqual(['i', 'i']);
    expect(diff(['a', 'b'], ['a', 'b'])).toEqual(['e', 'e']);
    expect(diff(['a'], ['b'])).toEqual(['d', 'i']);
  });

  it('classic example from the Myers paper: ABCABBA → CBABAC, D = 5', () => {
    const a = [...'ABCABBA'];
    const b = [...'CBABAC'];
    const ops = diff(a, b);
    expect(apply(a, b, ops)).toEqual([a, b]);
    expect(ops.filter((o) => o !== 'e').length).toBe(5);
  });

  it('is minimal and correct on random inputs (checked against LCS by dynamic programming)', () => {
    for (let t = 0; t < 400; t++) {
      const a = Array.from({ length: rand(30) }, () => rand(4));
      const b = Array.from({ length: rand(30) }, () => rand(4));
      const ops = diff(a, b);
      expect(apply(a, b, ops)).toEqual([a, b]);
      expect(ops.filter((o) => o === 'e').length).toBe(lcsLength(a, b));
    }
  });

  it('handles large inputs quickly', () => {
    const a = Array.from({ length: 20000 }, (_, i) => `line ${i}`);
    // Удаляем каждую сотую строку и меняем каждую 250-ю из оставшихся: все строки уникальны,
    // так что общих строк ровно столько, сколько не тронуто.
    const kept = a.filter((_, i) => i % 100 !== 0);
    const b = kept.map((s, i) => (i % 250 === 0 ? s + '!' : s));
    const changed = kept.filter((_, i) => i % 250 === 0).length;
    const start = performance.now();
    const ops = diff(a, b);
    expect(performance.now() - start).toBeLessThan(1000);
    expect(ops.filter((o) => o === 'e').length).toBe(kept.length - changed);
    expect(ops.filter((o) => o !== 'i').length).toBe(a.length);
    expect(ops.filter((o) => o !== 'd').length).toBe(b.length);
  });
});

describe('diffTexts', () => {
  it('counts added and removed lines and numbers them', () => {
    const r = diffTexts('one\ntwo\nthree\nfour', 'one\n2\nthree\nfour\nfive');
    expect(r.added).toBe(2);
    expect(r.removed).toBe(1);
    expect(r.blocks.map((b) => [b.kind, b.a.map((l) => l.no), b.b.map((l) => l.no)])).toEqual([
      ['equal', [1], [1]],
      ['change', [2], [2]],
      ['equal', [3, 4], [3, 4]],
      ['change', [], [5]],
    ]);
  });

  it('identical texts and different line endings', () => {
    const r = diffTexts('a\r\nb\n', 'a\nb\n');
    expect([r.added, r.removed]).toEqual([0, 0]);
    expect(r.blocks).toHaveLength(1);
  });

  it('highlights changed words in paired lines', () => {
    const r = diffTexts('The quick brown fox', 'The quick red fox');
    const [bl] = r.blocks;
    expect(bl.a[0].parts).toEqual([
      { text: 'The quick ', changed: false },
      { text: 'brown', changed: true },
      { text: ' fox', changed: false },
    ]);
    expect(bl.b[0].parts).toEqual([
      { text: 'The quick ', changed: false },
      { text: 'red', changed: true },
      { text: ' fox', changed: false },
    ]);
  });
});

describe('diffWords', () => {
  it('works with Cyrillic and punctuation', () => {
    expect(diffWords('Привет, мир!', 'Привет, мир?')).toEqual([
      [
        { text: 'Привет, мир', changed: false },
        { text: '!', changed: true },
      ],
      [
        { text: 'Привет, мир', changed: false },
        { text: '?', changed: true },
      ],
    ]);
  });

  it('no highlighting when lines share no words', () => {
    expect(diffWords('alpha beta', 'gamma delta')).toBeNull();
  });
});
