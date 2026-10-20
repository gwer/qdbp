import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Steps } from './Steps';

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

/** Смешанное число w n/d → числитель неправильной дроби; у отрицательного целого минус относится ко всему числу. */
export const improper = (w: bigint, n: bigint, d: bigint) => (w === 0n ? n : w < 0n ? w * d - n : w * d + n);

const lcm = (a: bigint, b: bigint) => (a / gcd(a, b)) * b;
const raw = (p: bigint, q: bigint) => `${sign(p)}${abs(p)}/${q}`;
const OP_SIGN: Record<Op, string> = { add: '+', subtract: MINUS, multiply: '×', divide: '÷' };

export interface Step {
  key: 'mixed' | 'common' | 'combine' | 'multiply' | 'divide' | 'reduce';
  params: Record<string, string>;
}

/** Короткий ход решения: перевод смешанных чисел, общий знаменатель (НОК) или умножение, сокращение на НОД. */
export function steps(w1: bigint, n1: bigint, d1: bigint, op: Op, w2: bigint, n2: bigint, d2: bigint): Step[] {
  const out: Step[] = [];
  let p1 = improper(w1, n1, d1);
  let p2 = improper(w2, n2, d2);
  if (w1 || w2) {
    const m = (w: bigint, n: bigint, d: bigint, p: bigint) => (w ? `${sign(w)}${abs(w)} ${n}/${d} = ${raw(p, d)}` : null);
    out.push({ key: 'mixed', params: { list: [m(w1, n1, d1, p1), m(w2, n2, d2, p2)].filter(Boolean).join('; ') } });
  }
  let num: bigint;
  let den: bigint;
  if (op === 'add' || op === 'subtract') {
    den = lcm(d1, d2);
    const a = p1 * (den / d1);
    const b = p2 * (den / d2);
    if (d1 !== d2) out.push({ key: 'common', params: { l: String(den), expr: `${raw(a, den)} ${OP_SIGN[op]} ${raw(b, den)}` } });
    num = op === 'add' ? a + b : a - b;
    out.push({ key: 'combine', params: { expr: `${a < 0n ? `(${MINUS}${abs(a)})` : a} ${OP_SIGN[op]} ${b < 0n ? `(${MINUS}${abs(b)})` : b} = ${sign(num)}${abs(num)}`, result: raw(num, den) } });
  } else {
    let q1 = d1;
    let q2 = d2;
    if (op === 'divide') {
      // Деление на дробь — умножение на перевёрнутую; знак переносим в числитель.
      [p2, q2] = p2 < 0n ? [-d2, -p2] : [d2, p2];
      out.push({ key: 'divide', params: { expr: `${raw(p1, q1)} × ${raw(p2, q2)}` } });
    }
    num = p1 * p2;
    den = q1 * q2;
    out.push({ key: 'multiply', params: { expr: `(${p1} × ${p2}) / (${q1} × ${q2}) = ${raw(num, den)}`.replace(/-/g, MINUS) } });
  }
  const g = gcd(num, den);
  if (g > 1n) out.push({ key: 'reduce', params: { g: String(g), result: fractionText(reduce(num, den)) } });
  return out;
}

export function fractions(n1: number, d1: number, op: Op, n2: number, d2: number, w1 = 0, w2 = 0) {
  // Больше 2^53 число уже пришло из поля с потерей точности
  if (![n1, d1, n2, d2, w1, w2].every(Number.isSafeInteger)) throw new InputError('tooLarge');
  const [W1, N1, D1, W2, N2, D2] = [w1, n1, d1, w2, n2, d2].map(BigInt);
  const r = calc(improper(W1, N1, D1), D1, op, improper(W2, N2, D2), D2);
  return {
    fraction: fractionText(r),
    mixed: mixedText(r),
    decimal: Number(r[0]) / Number(r[1]),
    steps: steps(W1, N1, D1, op, W2, N2, D2),
  };
}

export const def = defineCalculator({
  order: 90,
  related: ['proportion', 'what-percent'],
  inputs: {
    w1: { type: 'integer', default: 0 },
    n1: { type: 'integer', default: 1 },
    d1: { type: 'integer', default: 2, min: 1 },
    op: { type: 'select', options: ['add', 'subtract', 'multiply', 'divide'], default: 'add' },
    w2: { type: 'integer', default: 0 },
    n2: { type: 'integer', default: 1 },
    d2: { type: 'integer', default: 3, min: 1 },
  },
  errors: ['divisionByZero', 'tooLarge'],
  compute: ({ w1, n1, d1, op, w2, n2, d2 }) => fractions(n1, d1, op, n2, d2, w1, w2),
  outputs: {
    fraction: { type: 'text' },
    mixed: { type: 'text' },
    decimal: { digits: 6 },
  },
  Extra: Steps,
});

export default island(def);
