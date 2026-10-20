// Температура духовки: °C, °F и британские газовые отметки (gas mark).
// Газовая отметка 1 = 275 °F, каждая следующая — +25 °F, до 9 = 475 °F; ¼ = 225 °F, ½ = 250 °F.

export const GAS_MARKS = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type Scale = 'c' | 'f' | 'gas';

export const cToF = (c: number) => (c * 9) / 5 + 32;
export const fToC = (f: number) => ((f - 32) * 5) / 9;

export function gasToF(mark: number): number | null {
  if (mark === 0.25) return 225;
  if (mark === 0.5) return 250;
  return Number.isInteger(mark) && mark >= 1 && mark <= 9 ? 250 + 25 * mark : null;
}

/** Ближайшая газовая отметка (если температура в пределах ±12,5 °F от неё), иначе null. */
export function fToGas(f: number): number | null {
  let best: number | null = null;
  let diff = Infinity;
  for (const m of GAS_MARKS) {
    const d = Math.abs(gasToF(m)! - f);
    if (d < diff) {
      best = m;
      diff = d;
    }
  }
  return diff <= 12.5 ? best : null;
}

export const gasLabel = (m: number | null) => (m === null ? '—' : m === 0.25 ? '¼' : m === 0.5 ? '½' : String(m));

/** Режим с вентилятором (конвекция): −20 °C в Европе, −25 °F в США — общепринятые поправки. */
export function oven(value: number, scale: Scale) {
  const f = scale === 'f' ? value : scale === 'c' ? cToF(value) : gasToF(value);
  if (f === null) throw new RangeError('unknown gas mark');
  const c = fToC(f);
  return { c, f, gas: fToGas(f), fanC: c - 20, fanF: f - 25 };
}
