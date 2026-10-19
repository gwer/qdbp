import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Сухих компонентов нужно больше, чем объём готового бетона: вода заполняет пустоты, смесь уплотняется.
// Общепринятый в строительных расчётах по объёмным пропорциям коэффициент — 1,54.
const DRY_FACTOR = 1.54;
// Насыпная плотность цемента, кг/м³.
const CEMENT_DENSITY = 1440;
// Водоцементное отношение для ориентира по воде.
const WATER_CEMENT = 0.5;

/** Пропорции по объёму: цемент : песок : щебень. */
export const MIXES = { '1-2-4': [1, 2, 4], '1-2-3': [1, 2, 3], '1-3-5': [1, 3, 5], '1-3-6': [1, 3, 6] } as const;
export type Mix = keyof typeof MIXES;

/** Размеры — м, запас — %, мешок — кг. */
export function concrete(p: { length: number; width: number; thickness: number; reserve: number; mix: Mix; bag: number }) {
  const volume = p.length * p.width * p.thickness * (1 + p.reserve / 100);
  const [c, s, g] = MIXES[p.mix];
  const part = (volume * DRY_FACTOR) / (c + s + g); // м³ на одну часть
  const cement = part * c * CEMENT_DENSITY;
  return {
    volume,
    cement,
    bags: Math.ceil(cement / p.bag - 1e-9),
    sand: part * s,
    gravel: part * g,
    water: cement * WATER_CEMENT,
  };
}

export const def = defineCalculator({
  order: 50,
  related: ['bricks', 'aerated-blocks'],
  inputs: {
    length: { type: 'number', default: 6, min: 0 },
    width: { type: 'number', default: 4, min: 0 },
    thickness: { type: 'number', default: 0.15, min: 0 },
    reserve: { type: 'number', default: 5, min: 0, max: 50 },
    mix: { type: 'select', options: Object.keys(MIXES) as Mix[], default: '1-2-4' },
    bag: { type: 'number', default: 50, min: 1 },
  },
  compute: (v) => concrete(v),
  outputs: {
    volume: { digits: 2 },
    bags: { type: 'integer' },
    cement: { digits: 0 },
    sand: { digits: 2 },
    gravel: { digits: 2 },
    water: { digits: 0 },
  },
});

export default island(def);
