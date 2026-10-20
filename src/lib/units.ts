// Единицы измерения для полей и результатов калькуляторов.
// Инструмент задаёт значение в своей метрической единице (unit) и, если нужно, её аналог
// для американской системы (imperial). Расчёт всегда получает значение в метрической единице.

import type { Lang, UnitSystem } from '@/i18n/config';

export type { UnitSystem };

/** Множитель к базовой единице измерения (м, м², м³, кг, м²/м³). */
const BASE = {
  // длина → м
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  // площадь → м²
  m2: 1,
  ft2: 0.09290304,
  // объём → м³
  ml: 1e-6,
  l: 0.001,
  m3: 1,
  floz: 2.95735295625e-5,
  gal: 0.003785411784,
  ft3: 0.028316846592,
  yd3: 0.764554857984,
  // масса → кг
  g: 0.001,
  kg: 1,
  oz: 0.028349523125,
  lb: 0.45359237,
  // покрытие (площадь на объём) → м²/м³
  m2_per_l: 1000,
  ft2_per_gal: 0.09290304 / 0.003785411784,
  // расход на площадь (масса на площадь) → кг/м²
  kg_per_m2: 1,
  lb_per_ft2: 0.45359237 / 0.09290304,
} as const;

export type UnitId = keyof typeof BASE;

const DIMENSION: Record<UnitId, string> = {
  mm: 'length', cm: 'length', m: 'length', km: 'length', in: 'length', ft: 'length', yd: 'length', mi: 'length',
  m2: 'area', ft2: 'area',
  ml: 'volume', l: 'volume', m3: 'volume', floz: 'volume', gal: 'volume', ft3: 'volume', yd3: 'volume',
  g: 'mass', kg: 'mass', oz: 'mass', lb: 'mass',
  m2_per_l: 'coverage', ft2_per_gal: 'coverage',
  kg_per_m2: 'areal-density', lb_per_ft2: 'areal-density',
};

export function convert(value: number, from: UnitId, to: UnitId): number {
  if (from === to) return value;
  if (DIMENSION[from] !== DIMENSION[to]) throw new Error(`units: ${from} → ${to}`);
  return (value * BASE[from]) / BASE[to];
}

/** Единица, в которой поле показывается пользователю в выбранной системе. */
export const displayUnit = (spec: { unit: UnitId; imperial?: UnitId }, system: UnitSystem): UnitId =>
  system === 'imperial' && spec.imperial ? spec.imperial : spec.unit;

/** Округление для хранения (URL): 6 значащих цифр убирают хвосты вроде 13.123359580052. */
export const tidy = (n: number) => Number(n.toPrecision(6));

/** Округление для показа сконвертированного значения в поле: до сотых, у совсем малых — 2 значащие цифры. */
export const forField = (n: number) => (Math.abs(n) >= 0.1 ? Math.round(n * 100) / 100 : Number(n.toPrecision(2)));

// Обозначения. Международные (латиница) — по умолчанию; русские и американские — переопределения.
const LATIN: Record<UnitId, string> = {
  mm: 'mm', cm: 'cm', m: 'm', km: 'km', in: 'in', ft: 'ft', yd: 'yd', mi: 'mi',
  m2: 'm²', ft2: 'ft²',
  ml: 'ml', l: 'l', m3: 'm³', floz: 'fl oz', gal: 'gal', ft3: 'ft³', yd3: 'yd³',
  g: 'g', kg: 'kg', oz: 'oz', lb: 'lb',
  m2_per_l: 'm²/l', ft2_per_gal: 'ft²/gal',
  kg_per_m2: 'kg/m²', lb_per_ft2: 'lb/ft²',
};
const OVERRIDES: Partial<Record<Lang, Partial<Record<UnitId, string>>>> = {
  ru: {
    mm: 'мм', cm: 'см', m: 'м', km: 'км', in: 'дюйм', ft: 'фут', yd: 'ярд', mi: 'миля',
    m2: 'м²', ft2: 'фут²', ml: 'мл', l: 'л', m3: 'м³', floz: 'жидк. унц.', gal: 'гал', ft3: 'фут³', yd3: 'ярд³',
    g: 'г', kg: 'кг', oz: 'унц.', lb: 'фунт', m2_per_l: 'м²/л', ft2_per_gal: 'фут²/гал',
    kg_per_m2: 'кг/м²', lb_per_ft2: 'фунт/фут²',
  },
  en: { l: 'L', ml: 'mL', ft2: 'sq ft', ft3: 'cu ft', yd3: 'cu yd', ft2_per_gal: 'sq ft/gal', m2_per_l: 'm²/L', lb_per_ft2: 'lb/sq ft' },
};

export const unitSymbol = (lang: Lang, unit: UnitId) => OVERRIDES[lang]?.[unit] ?? LATIN[unit];

/**
 * Рост и длины в американской записи «5'10"», «5' 10», «5ft 10in» → дюймы. Иначе null.
 * Используется для полей, которые в американской системе показываются в дюймах.
 */
export function parseFeetInches(input: string): number | null {
  const m = /^\s*(\d+)\s*(?:'|’|ft)\s*(?:(\d+(?:[.,]\d+)?)\s*(?:"|”|''|in)?)?\s*$/i.exec(input);
  if (!m) return null;
  const inches = m[2] === undefined ? 0 : Number(m[2].replace(',', '.'));
  return inches >= 12 ? null : Number(m[1]) * 12 + inches;
}
