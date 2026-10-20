import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Сухих компонентов нужно больше, чем объём готового бетона: вода заполняет пустоты, смесь уплотняется.
// Общепринятый в строительных расчётах по объёмным пропорциям коэффициент — 1,54.
const DRY_FACTOR = 1.54;
// Насыпная плотность цемента, кг/м³.
const CEMENT_DENSITY = 1440;
// Водоцементное отношение для ориентира по воде.
const WATER_CEMENT = 0.5;
// Сухой готовой смеси на 1 м³ бетона, кг: мешок 80 lb даёт 0,60 cu ft (данные Quikrete), то есть ≈ 2136 кг/м³.
const PREMIX_PER_M3 = (80 * 0.45359237) / (0.6 * 0.028316846592);

/** Пропорции по объёму: цемент : песок : щебень. */
export const MIXES = { '1-2-4': [1, 2, 4], '1-2-3': [1, 2, 3], '1-3-5': [1, 3, 5], '1-3-6': [1, 3, 6] } as const;
export type Mix = keyof typeof MIXES;

export type Shape = 'slab' | 'strip' | 'columns';

/**
 * Объём без запаса, м³: плита — длина × ширина × толщина; лента — общая длина ленты (периметр плюс внутренние стены)
 * × ширина × высота; столбы (сваи) — π·d²/4 × высота × количество.
 */
export function shapeVolume(p: {
  shape: Shape;
  length: number;
  width: number;
  thickness: number;
  stripLength: number;
  stripWidth: number;
  stripHeight: number;
  diameter: number;
  depth: number;
  count: number;
}): number {
  if (p.shape === 'strip') return p.stripLength * p.stripWidth * p.stripHeight;
  if (p.shape === 'columns') return ((Math.PI * p.diameter ** 2) / 4) * p.depth * p.count;
  return p.length * p.width * p.thickness;
}

/** Объём — м³ без запаса, запас — %, мешки — кг. */
export function concrete(p: {
  volume: number;
  reserve: number;
  mix: Mix;
  bag: number;
  premixBag: number;
}) {
  const volume = p.volume * (1 + p.reserve / 100);
  const [c, s, g] = MIXES[p.mix];
  const part = (volume * DRY_FACTOR) / (c + s + g); // м³ на одну часть
  const cement = part * c * CEMENT_DENSITY;
  return {
    volume,
    premixBags: Math.ceil((volume * PREMIX_PER_M3) / p.premixBag - 1e-9),
    bags: Math.ceil(cement / p.bag - 1e-9),
    cement,
    sand: part * s,
    gravel: part * g,
    water: cement * WATER_CEMENT,
  };
}

export const def = defineCalculator({
  order: 50,
  related: ['bricks', 'aerated-blocks'],
  inputs: {
    shape: { type: 'select', options: ['slab', 'strip', 'columns'], default: 'slab' },
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 6, defaultImperial: 20, min: 0, showIf: { shape: 'slab' } },
    width: { type: 'quantity', unit: 'm', imperial: 'ft', default: 4, defaultImperial: 12, min: 0, showIf: { shape: 'slab' } },
    thickness: { type: 'quantity', unit: 'm', imperial: 'in', default: 0.15, defaultImperial: 4, min: 0, showIf: { shape: 'slab' } },
    // Лента дома 6 × 8 м с одной внутренней стеной: 28 + 6 = 34 м; ширина 0,4 м, высота 1 м (с заглублением).
    stripLength: { type: 'quantity', unit: 'm', imperial: 'ft', default: 34, defaultImperial: 112, min: 0, showIf: { shape: 'strip' } },
    stripWidth: { type: 'quantity', unit: 'm', imperial: 'in', default: 0.4, defaultImperial: 16, min: 0, showIf: { shape: 'strip' } },
    stripHeight: { type: 'quantity', unit: 'm', imperial: 'ft', default: 1, defaultImperial: 3, min: 0, showIf: { shape: 'strip' } },
    diameter: { type: 'quantity', unit: 'm', imperial: 'in', default: 0.2, defaultImperial: 8, min: 0, showIf: { shape: 'columns' } },
    depth: { type: 'quantity', unit: 'm', imperial: 'ft', default: 1.5, defaultImperial: 4, min: 0, showIf: { shape: 'columns' } },
    count: { type: 'integer', default: 12, min: 1, max: 1000, showIf: { shape: 'columns' } },
    reserve: { type: 'percent', default: 5, min: 0, max: 50 },
    // Готовая сухая смесь: в США мешки 60/80 lb, в Европе — 25–40 кг.
    premixBag: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 40, defaultImperial: 80, min: 1, byLang: { de: 25, es: 25 } },
    mix: { type: 'select', options: Object.keys(MIXES) as Mix[], default: '1-2-4' },
    // Мешок цемента: 50 кг (ru, pt), 25 кг (de, es); портландцемент в США — 94 lb.
    bag: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 50, defaultImperial: 94, min: 1, byLang: { ru: 50, de: 25, es: 25, pt: 50 } },
  },
  compute: (v) => concrete({ ...v, volume: shapeVolume(v) }),
  outputs: {
    volume: { type: 'quantity', unit: 'm3', imperial: 'yd3', digits: 2 },
    premixBags: { type: 'integer' },
    bags: { type: 'integer' },
    cement: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 0 },
    sand: { type: 'quantity', unit: 'm3', imperial: 'yd3', digits: 2 },
    gravel: { type: 'quantity', unit: 'm3', imperial: 'yd3', digits: 2 },
    water: { type: 'quantity', unit: 'l', imperial: 'gal', digits: 0 },
  },
});

export default island(def);
