// Единицы конвертеров величин. Каждая единица задаётся переводом в базовую единицу величины и обратно:
// линейные — множителем по точным определениям, температура и расход топлива — формулами.

export interface Unit {
  id: string;
  toBase: (x: number) => number;
  fromBase: (x: number) => number;
}

const lin = (id: string, factor: number): Unit => ({ id, toBase: (x) => x * factor, fromBase: (x) => x / factor });

/** Обратная зависимость: база = k / значение (расход топлива в мили на галлон, км на литр). */
const inv = (id: string, k: number): Unit => ({ id, toBase: (x) => k / x, fromBase: (x) => k / x });

export const DIMENSIONS = {
  // база — метр
  length: [
    lin('mm', 0.001), lin('cm', 0.01), lin('m', 1), lin('km', 1000),
    lin('in', 0.0254), lin('ft', 0.3048), lin('yd', 0.9144), lin('mi', 1609.344), lin('nmi', 1852),
  ],
  // база — килограмм
  weight: [
    lin('mg', 1e-6), lin('g', 0.001), lin('kg', 1), lin('t', 1000), lin('ct', 0.0002),
    lin('oz', 0.028349523125), lin('lb', 0.45359237), lin('st', 6.35029318), lin('shortTon', 907.18474), lin('longTon', 1016.0469088),
  ],
  // база — литр
  volume: [
    lin('ml', 0.001), lin('l', 1), lin('m3', 1000),
    lin('tsp', 0.00492892159375), lin('tbsp', 0.01478676478125), lin('flozUs', 0.0295735295625), lin('cupUs', 0.2365882365),
    lin('pintUs', 0.473176473), lin('quartUs', 0.946352946), lin('galUs', 3.785411784),
    lin('flozUk', 0.0284130625), lin('pintUk', 0.56826125), lin('galUk', 4.54609),
    lin('in3', 0.016387064), lin('ft3', 28.316846592),
  ],
  // база — квадратный метр
  area: [
    lin('cm2', 1e-4), lin('m2', 1), lin('are', 100), lin('ha', 10000), lin('km2', 1e6),
    lin('in2', 0.00064516), lin('ft2', 0.09290304), lin('yd2', 0.83612736), lin('acre', 4046.8564224), lin('mi2', 2589988.110336),
  ],
  // база — градус Цельсия
  temperature: [
    { id: 'c', toBase: (x: number) => x, fromBase: (x: number) => x },
    { id: 'f', toBase: (x: number) => ((x - 32) * 5) / 9, fromBase: (x: number) => (x * 9) / 5 + 32 },
    { id: 'k', toBase: (x: number) => x - 273.15, fromBase: (x: number) => x + 273.15 },
  ],
  // база — метр в секунду
  speed: [lin('ms', 1), lin('kmh', 1 / 3.6), lin('mph', 0.44704), lin('knot', 1852 / 3600), lin('fts', 0.3048)],
  // база — паскаль
  pressure: [
    lin('pa', 1), lin('kpa', 1000), lin('mpa', 1e6), lin('bar', 1e5), lin('atm', 101325),
    lin('at', 98066.5), lin('mmhg', 133.322387415), lin('psi', 6894.757293168361), lin('inhg', 3386.389),
  ],
  // база — джоуль
  energy: [
    lin('j', 1), lin('kj', 1000), lin('mj', 1e6), lin('cal', 4.184), lin('kcal', 4184),
    lin('wh', 3600), lin('kwh', 3.6e6), lin('btu', 1055.05585262),
  ],
  // база — байт
  data: [
    lin('bit', 1 / 8), lin('b', 1), lin('kb', 1e3), lin('mb', 1e6), lin('gb', 1e9), lin('tb', 1e12),
    lin('kib', 1024), lin('mib', 1024 ** 2), lin('gib', 1024 ** 3), lin('tib', 1024 ** 4),
  ],
  // база — литры на 100 км
  fuel: [
    { id: 'l100', toBase: (x: number) => x, fromBase: (x: number) => x },
    inv('kml', 100),
    inv('mpgUs', (100 * 3.785411784) / 1.609344),
    inv('mpgUk', (100 * 4.54609) / 1.609344),
  ],
} satisfies Record<string, Unit[]>;

export type Dimension = keyof typeof DIMENSIONS;

export function unitOf(dim: Dimension, id: string): Unit | undefined {
  return (DIMENSIONS[dim] as Unit[]).find((u) => u.id === id);
}

export function convertValue(dim: Dimension, value: number, from: string, to: string): number {
  const a = unitOf(dim, from);
  const b = unitOf(dim, to);
  if (!a || !b) throw new Error(`unknown unit ${from} → ${to}`);
  return b.fromBase(a.toBase(value));
}

/** Ниже абсолютного нуля температуры не бывает; расход топлива — только положительный. */
export function isValid(dim: Dimension, value: number, from: string): boolean {
  if (!Number.isFinite(value)) return false;
  if (dim === 'temperature') return unitOf(dim, from)!.toBase(value) >= -273.15 - 1e-9;
  if (dim === 'fuel') return value > 0;
  return true;
}
