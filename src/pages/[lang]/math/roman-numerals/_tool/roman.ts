const TABLE: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export const MIN = 1;
export const MAX = 3999;

export function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < MIN || n > MAX) return null;
  let out = '';
  for (const [value, sym] of TABLE) {
    while (n >= value) {
      out += sym;
      n -= value;
    }
  }
  return out;
}

// Только правильная (каноническая) запись: «IIII», «IC», «VX» — ошибка.
const CANONICAL = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

export function fromRoman(input: string): number | null {
  const s = input.trim().toUpperCase();
  if (!s || !CANONICAL.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = VALUES[s[i]];
    const next = VALUES[s[i + 1]] ?? 0;
    total += v < next ? -v : v;
  }
  return total;
}

export type Converted = { kind: 'toRoman'; value: string } | { kind: 'fromRoman'; value: number } | { kind: 'error'; reason: 'range' | 'roman' };

/** Определяет направление по вводу: цифры → в римские, буквы → в арабские. */
export function convert(input: string): Converted | null {
  const s = input.trim().replace(/[\s ]/g, '');
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const r = toRoman(Number(s));
    return r ? { kind: 'toRoman', value: r } : { kind: 'error', reason: 'range' };
  }
  const n = fromRoman(s);
  return n === null ? { kind: 'error', reason: 'roman' } : { kind: 'fromRoman', value: n };
}
