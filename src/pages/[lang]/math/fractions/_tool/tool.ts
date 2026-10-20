import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Op = 'add' | 'subtract' | 'multiply' | 'divide';

// Точная арифметика на BigInt: произведения числителей и знаменателей легко выходят
// за 2^53, и в number точность теряется ещё до сокращения.
const abs = (a: bigint) => (a < 0n ? -a : a);
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? abs(a) : gcd(b, a % b));
const MINUS = '−';

/** Несократимая дробь p/q с положительным знаменателем. */
export function reduce(p: bigint, q: bigint): [bigint, bigint] {
  if (q === 0n) throw new RangeError('zero denominator');
  const g = gcd(p, q) || 1n;
  const sign = q < 0n ? -1n : 1n;
  return [(sign * p) / g, (sign * q) / g];
}

export function calc(n1: bigint, d1: bigint, op: Op, n2: bigint, d2: bigint): [bigint, bigint] {
  switch (op) {
    case 'add':
      return reduce(n1 * d2 + n2 * d1, d1 * d2);
    case 'subtract':
      return reduce(n1 * d2 - n2 * d1, d1 * d2);
    case 'multiply':
      return reduce(n1 * n2, d1 * d2);
    case 'divide':
      if (n2 === 0n) throw new InputError('divisionByZero');
      return reduce(n1 * d2, d1 * n2);
  }
}

const sign = (n: bigint) => (n < 0n ? MINUS : '');

/** «5/6», «−1/6», «3» (если знаменатель 1). */
export const fractionText = ([p, q]: [bigint, bigint]) => (q === 1n ? `${sign(p)}${abs(p)}` : `${sign(p)}${abs(p)}/${q}`);

/** Смешанное число: «1 1/6»; для правильной дроби — сама дробь. */
export function mixedText([p, q]: [bigint, bigint]): string {
  const whole = abs(p) / q;
  const rest = abs(p) % q;
  if (whole === 0n || rest === 0n) return fractionText([p, q]);
  return `${sign(p)}${whole} ${rest}/${q}`;
}

export function fractions(n1: number, d1: number, op: Op, n2: number, d2: number) {
  // Больше 2^53 число уже пришло из поля с потерей точности
  if (![n1, d1, n2, d2].every(Number.isSafeInteger)) throw new InputError('tooLarge');
  const r = calc(BigInt(n1), BigInt(d1), op, BigInt(n2), BigInt(d2));
  return { fraction: fractionText(r), mixed: mixedText(r), decimal: Number(r[0]) / Number(r[1]) };
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
  errors: ['divisionByZero', 'tooLarge'],
  compute: ({ n1, d1, op, n2, d2 }) => fractions(n1, d1, op, n2, d2),
  outputs: {
    fraction: { type: 'text' },
    mixed: { type: 'text' },
    decimal: { digits: 6 },
  },
});

export default island(def);
