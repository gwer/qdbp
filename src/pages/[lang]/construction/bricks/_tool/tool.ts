import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Форматы кирпича: длина × ширина × высота, мм. */
export const FORMATS = {
  '250x120x65': [250, 120, 65],
  '250x120x88': [250, 120, 88],
  '240x115x71': [240, 115, 71],
  '240x115x52': [240, 115, 52],
  '240x115x50': [240, 115, 50],
  '240x115x70': [240, 115, 70],
  '190x90x57': [190, 90, 57],
  // Модульный кирпич США: 7-5/8 × 3-5/8 × 2-1/4 in.
  'us-modular': [193.675, 92.075, 57.15],
} as const;
export type Format = keyof typeof FORMATS;

/** Толщина кладки в «полукирпичах» (в США — wythe): ½ кирпича — один ряд ложками, 1 кирпич — два и т. д. */
export const THICKNESS = { half: 1, one: 2, oneHalf: 3, two: 4 } as const;
export type Thickness = keyof typeof THICKNESS;

/**
 * Стена — м, проёмы — м², шов — мм, запас — %.
 * Штук на 1 м² кладки в полкирпича = 1 / ((длина + шов) × (высота + шов));
 * у всех форматов длина ≈ 2 ширины + шов, поэтому для толстой кладки — кратно числу полукирпичей.
 */
export function bricks(p: {
  length: number;
  height: number;
  openings: number;
  format: Format;
  thickness: Thickness;
  joint: number;
  reserve: number;
}) {
  const [l, , h] = FORMATS[p.format];
  const area = Math.max(0, p.length * p.height - p.openings);
  const perM2 = (1 / (((l + p.joint) / 1000) * ((h + p.joint) / 1000))) * THICKNESS[p.thickness];
  return { bricks: Math.ceil(area * perM2 * (1 + p.reserve / 100) - 1e-9), area, perM2 };
}

export const def = defineCalculator({
  order: 60,
  related: ['aerated-blocks', 'concrete'],
  inputs: {
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 6, defaultImperial: 20, min: 0 },
    height: { type: 'quantity', unit: 'm', imperial: 'ft', default: 2.7, defaultImperial: 8, min: 0 },
    openings: { type: 'quantity', unit: 'm2', imperial: 'ft2', default: 2, defaultImperial: 21, min: 0 },
    format: {
      type: 'select',
      options: Object.keys(FORMATS) as Format[],
      default: '250x120x65',
      byLang: { ru: '250x120x65', de: '240x115x71', es: '240x115x70', pt: '190x90x57', en: 'us-modular' },
    },
    thickness: { type: 'select', options: ['half', 'one', 'oneHalf', 'two'], default: 'half', byLang: { ru: 'one' } },
    joint: { type: 'quantity', unit: 'mm', imperial: 'in', default: 10, defaultImperial: 0.375, min: 0, max: 30 },
    reserve: { type: 'percent', default: 5, min: 0, max: 50 },
  },
  compute: (v) => bricks(v),
  outputs: {
    bricks: { type: 'integer' },
    area: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
  },
});

export default island(def);
