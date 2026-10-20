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

/** Размеры — м, запас — %, мешки — кг. */
export function concrete(p: {
  length: number;
  width: number;
  thickness: number;
  reserve: number;
  mix: Mix;
  bag: number;
  premixBag: number;
}) {
  const volume = p.length * p.width * p.thickness * (1 + p.reserve / 100);
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
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 6, defaultImperial: 20, min: 0 },
    width: { type: 'quantity', unit: 'm', imperial: 'ft', default: 4, defaultImperial: 12, min: 0 },
    thickness: { type: 'quantity', unit: 'm', imperial: 'in', default: 0.15, defaultImperial: 4, min: 0 },
    reserve: { type: 'percent', default: 5, min: 0, max: 50 },
    // Готовая сухая смесь: в США мешки 60/80 lb, в Европе — 25–40 кг.
    premixBag: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 40, defaultImperial: 80, min: 1, byLang: { de: 25, es: 25 } },
    mix: { type: 'select', options: Object.keys(MIXES) as Mix[], default: '1-2-4' },
    // Мешок цемента: 50 кг (ru, pt), 25 кг (de, es); портландцемент в США — 94 lb.
    bag: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 50, defaultImperial: 94, min: 1, byLang: { ru: 50, de: 25, es: 25, pt: 50 } },
  },
  compute: (v) => concrete(v),
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
