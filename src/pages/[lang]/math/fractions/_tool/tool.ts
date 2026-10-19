import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Op = 'add' | 'subtract' | 'multiply' | 'divide';

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const MINUS = '−';

/** Несократимая дробь p/q с положительным знаменателем. */
export function reduce(p: number, q: number): [number, number] {
  if (q === 0) throw new RangeError('zero denominator');
  const g = gcd(p, q) || 1;
  const sign = q < 0 ? -1 : 1;
  return [(sign * p) / g, (sign * q) / g];
}

export function calc(n1: number, d1: number, op: Op, n2: number, d2: number): [number, number] {
  switch (op) {
    case 'add':
      return reduce(n1 * d2 + n2 * d1, d1 * d2);
    case 'subtract':
      return reduce(n1 * d2 - n2 * d1, d1 * d2);
    case 'multiply':
      return reduce(n1 * n2, d1 * d2);
    case 'divide':
      if (n2 === 0) throw new RangeError('division by zero');
      return reduce(n1 * d2, d1 * n2);
  }
}

const sign = (n: number) => (n < 0 ? MINUS : '');

/** «5/6», «−1/6», «3» (если знаменатель 1). */
export const fractionText = ([p, q]: [number, number]) => (q === 1 ? `${sign(p)}${Math.abs(p)}` : `${sign(p)}${Math.abs(p)}/${q}`);

/** Смешанное число: «1 1/6»; для правильной дроби — сама дробь. */
export function mixedText([p, q]: [number, number]): string {
  const whole = Math.trunc(Math.abs(p) / q);
  const rest = Math.abs(p) % q;
  if (whole === 0 || rest === 0) return fractionText([p, q]);
  return `${sign(p)}${whole} ${rest}/${q}`;
}

export function fractions(n1: number, d1: number, op: Op, n2: number, d2: number) {
  const r = calc(n1, d1, op, n2, d2);
  if (!r.every(Number.isSafeInteger)) throw new RangeError('too large');
  return { fraction: fractionText(r), mixed: mixedText(r), decimal: r[0] / r[1] };
}

export const def = defineCalculator({
  order: 90,
  related: ['proportion', 'what-percent'],
  inputs: {
    n1: { type: 'integer', default: 1 },
    d1: { type: 'integer', default: 2, min: 1 },
    op: { type: 'select', options: ['add', 'subtract', 'multiply', 'divide'], default: 'add' },
    n2: { type: 'integer', default: 1 },
    d2: { type: 'integer', default: 3, min: 1 },
  },
  compute: ({ n1, d1, op, n2, d2 }) => fractions(n1, d1, op, n2, d2),
  outputs: {
    fraction: { type: 'text' },
    mixed: { type: 'text' },
    decimal: { digits: 6 },
  },
});

export default island(def);
