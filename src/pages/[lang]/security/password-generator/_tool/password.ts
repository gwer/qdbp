export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const;
export type SetName = keyof typeof SETS;

/** Похожие на вид символы, которые путают при ручном вводе. */
const SIMILAR = new Set('Il1O0o|');

/** Источник случайных 32-битных чисел. В браузере — crypto.getRandomValues. */
export type Random = () => number;
export const cryptoRandom: Random = () => crypto.getRandomValues(new Uint32Array(1))[0];

/** Равномерное целое в [0, max) без смещения по модулю (отбрасываем «хвост» диапазона). */
export function randomInt(max: number, random: Random): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  for (;;) {
    const x = random();
    if (x < limit) return x % max;
  }
}

export interface Options {
  length: number;
  sets: SetName[];
  noSimilar: boolean;
}

export function pools(opts: Options): string[] {
  return opts.sets.map((s) => [...SETS[s]].filter((c) => !opts.noSimilar || !SIMILAR.has(c)).join(''));
}

/** Пароль с хотя бы одним символом каждого выбранного набора; позиции перемешаны. */
export function generate(opts: Options, random: Random = cryptoRandom): string {
  const ps = pools(opts);
  if (!ps.length || opts.length < ps.length) throw new RangeError('invalid options');
  const all = ps.join('');
  const chars = ps.map((p) => p[randomInt(p.length, random)]);
  while (chars.length < opts.length) chars.push(all[randomInt(all.length, random)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/** Энтропия для пароля из случайных символов: length × log2(размер алфавита). */
export const entropyBits = (opts: Options) => opts.length * Math.log2(pools(opts).join('').length);

export type Strength = 'weak' | 'fair' | 'strong' | 'veryStrong';
export const strength = (bits: number): Strength => (bits < 40 ? 'weak' : bits < 60 ? 'fair' : bits < 80 ? 'strong' : 'veryStrong');
