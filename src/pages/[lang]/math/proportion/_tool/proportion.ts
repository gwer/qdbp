export type Kind = 'direct' | 'inverse';

export type Solution =
  | { ok: true; index: number; value: number; /** x = p × q / r */ p: number; q: number; r: number }
  | { ok: false; reason: 'unknown' | 'zero' };

/**
 * Пропорция из четырёх чисел, одно из которых неизвестно (null).
 * Прямая: a / b = c / d (a·d = b·c). Обратная: a × b = c × d.
 * Неизвестное = произведение другой пары / его пара.
 */
export function solve(values: readonly (number | null)[], kind: Kind): Solution {
  const unknown = values.flatMap((v, i) => (v === null ? [i] : []));
  if (unknown.length !== 1) return { ok: false, reason: 'unknown' };
  const i = unknown[0];
  const v = values as number[];
  // Прямая: перемножаются крест-накрест (a с d, b с c). Обратная: внутри пары (a с b, c с d).
  const partner = kind === 'direct' ? 3 - i : i ^ 1;
  const [pi, qi] = kind === 'direct' ? (i === 0 || i === 3 ? [1, 2] : [0, 3]) : i < 2 ? [2, 3] : [0, 1];
  const r = v[partner];
  if (r === 0) return { ok: false, reason: 'zero' };
  return { ok: true, index: i, value: (v[pi] * v[qi]) / r, p: v[pi], q: v[qi], r };
}
