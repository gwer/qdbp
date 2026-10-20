// Криптографически стойкая равномерная случайность (без смещения по модулю).

/** Источник случайных 32-битных чисел; в тестах подменяется детерминированным. */
export type Random = () => number;
export const cryptoRandom: Random = () => crypto.getRandomValues(new Uint32Array(1))[0];

/** Целое в [0, max), max ≤ 2³². */
export function randomInt(max: number, random: Random = cryptoRandom): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  for (;;) {
    const x = random();
    if (x < limit) return x % max;
  }
}

/** Перемешивание Фишера — Йетса; исходный массив не меняется. */
export function shuffle<T>(items: readonly T[], random: Random = cryptoRandom): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Разбиение на n групп как можно ровнее (размеры отличаются не больше чем на 1). */
export function splitIntoGroups<T>(items: readonly T[], n: number, random: Random = cryptoRandom): T[][] {
  const groups: T[][] = Array.from({ length: n }, () => []);
  shuffle(items, random).forEach((item, i) => groups[i % n].push(item));
  return groups;
}

/** Строки списка без пустых и пробелов по краям. */
export const listItems = (text: string) =>
  text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
