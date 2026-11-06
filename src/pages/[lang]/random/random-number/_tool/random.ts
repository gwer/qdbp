/** Источник случайных 32-битных целых без знака. */
export type Uint32Source = () => number;

export const cryptoSource: Uint32Source = () => crypto.getRandomValues(new Uint32Array(1))[0];

const TWO_32 = 2 ** 32;
const TWO_53 = 2 ** 53;
/** Самый большой поддерживаемый диапазон: целые до 2^53 без потери точности. */
export const MAX_ABS = Number.MAX_SAFE_INTEGER;

/**
 * Равномерное целое из [min, max] без смещения: значения из «хвоста», который не делится
 * на размер диапазона нацело, отбрасываются и запрашиваются заново (rejection sampling).
 */
export function randomInt(min: number, max: number, next: Uint32Source = cryptoSource): number {
  const size = max - min + 1;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || size < 1 || !Number.isSafeInteger(size)) {
    throw new RangeError('invalid range');
  }
  if (size <= TWO_32) {
    const limit = TWO_32 - (TWO_32 % size);
    for (;;) {
      const x = next();
      if (x < limit) return min + (x % size);
    }
  }
  // Большие диапазоны: 53 случайных бита из двух 32-битных чисел.
  const limit = TWO_53 - (TWO_53 % size);
  for (;;) {
    const x = (next() >>> 11) * TWO_32 + next();
    if (x < limit) return min + (x % size);
  }
}

export interface DrawOptions {
  min: number;
  max: number;
  count: number;
  unique: boolean;
}

/** Серия случайных чисел; без повторов — частичная перетасовка или выборка с отбрасыванием повторов. */
export function draw({ min, max, count, unique }: DrawOptions, next: Uint32Source = cryptoSource): number[] {
  const size = max - min + 1;
  if (unique && count > size) throw new RangeError('not enough distinct values');
  if (!unique) return Array.from({ length: count }, () => randomInt(min, max, next));
  if (size <= 10_000 && count > size / 4) {
    // Перетасовка Фишера — Йетса первых count элементов диапазона.
    const pool = Array.from({ length: size }, (_, i) => min + i);
    for (let i = 0; i < count; i++) {
      const j = randomInt(i, size - 1, next);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }
  const seen = new Set<number>();
  const out: number[] = [];
  while (out.length < count) {
    const x = randomInt(min, max, next);
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}
