// Размеры взрослой обуви. Источник: Wikipedia «Shoe size», таблица соответствия по длине стопы
// (Mondopoint, ISO 9407 — длина стопы в мм; EU — парижский штих; UK; US мужской; US женский по
// распространённой шкале «мужской + 1»). Реальные колодки разных брендов отличаются на полразмера.

export const SYSTEMS = ['eu', 'uk', 'usM', 'usW', 'cm'] as const;
export type System = (typeof SYSTEMS)[number];

export interface ShoeRow {
  mm: number;
  eu: number;
  uk: number;
  usM: number;
  usW: number;
}

// [мм, EU, UK, US мужской]; US женский = US мужской + 1.
const RAW: [number, number, number, number][] = [
  [215, 34, 2.5, 3.5],
  [220, 35, 3, 4],
  [225, 35.5, 3.5, 4.5],
  [230, 36.5, 4, 5],
  [235, 37, 4.5, 5.5],
  [240, 38, 5.5, 6.5],
  [245, 38.5, 6, 7],
  [250, 39.5, 6.5, 7.5],
  [255, 40, 7, 8],
  [260, 41, 7.5, 8.5],
  [265, 41.5, 8.5, 9.5],
  [270, 42.5, 9, 10],
  [275, 43, 9.5, 10.5],
  [280, 44, 10, 11],
  [285, 44.5, 10.5, 11.5],
  [290, 45.5, 11, 12],
  [295, 46, 12, 13],
  [300, 47, 12.5, 13.5],
  [305, 47.5, 13, 14],
  [310, 48.5, 13.5, 14.5],
  [315, 49, 14, 15],
  [320, 50, 15, 16],
];

export const SHOES: ShoeRow[] = RAW.map(([mm, eu, uk, usM]) => ({ mm, eu, uk, usM, usW: usM + 1 }));

/**
 * Строка таблицы для размера в выбранной системе.
 * Длина стопы (см) округляется вверх до 5 мм — обувь не должна быть короче стопы.
 * Размер в другой системе — ближайший в таблице, если отличается не больше чем на полразмера.
 */
export function findShoe(value: number, system: System): ShoeRow {
  if (system === 'cm') {
    const mm = Math.ceil(Math.round(value * 100) / 50) * 5;
    const row = SHOES.find((r) => r.mm >= mm);
    if (!row || mm < SHOES[0].mm) throw new RangeError('out of range');
    return row;
  }
  let best = SHOES[0];
  for (const r of SHOES) if (Math.abs(r[system] - value) < Math.abs(best[system] - value)) best = r;
  if (Math.abs(best[system] - value) > 0.5) throw new RangeError('out of range');
  return best;
}
