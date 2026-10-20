import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * Стена — м, проёмы — м², размеры блока — мм, запас — %.
 * Газоблоки кладут на клей со швом 1–3 мм, поэтому шов в расчёте не учитывается.
 */
export function blocks(p: {
  length: number;
  height: number;
  openings: number;
  blockLength: number;
  blockHeight: number;
  blockThickness: number;
  reserve: number;
  /** Расход клея, кг на 1 м³ кладки (по техническим листам — 16–26 кг при шве 2 мм). */
  glueRate: number;
  /** Мешок клея, кг. */
  glueBag: number;
}) {
  const area = Math.max(0, p.length * p.height - p.openings);
  const face = (p.blockLength / 1000) * (p.blockHeight / 1000);
  const count = Math.ceil((area / face) * (1 + p.reserve / 100) - 1e-9);
  const glue = area * (p.blockThickness / 1000) * p.glueRate;
  return {
    blocks: count,
    volume: count * face * (p.blockThickness / 1000),
    glue,
    glueBags: p.glueBag > 0 ? Math.ceil(glue / p.glueBag - 1e-9) : 0,
    area,
  };
}

export const def = defineCalculator({
  order: 70,
  related: ['bricks', 'concrete'],
  inputs: {
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 6, defaultImperial: 20, min: 0 },
    height: { type: 'quantity', unit: 'm', imperial: 'ft', default: 2.7, defaultImperial: 8, min: 0 },
    openings: { type: 'quantity', unit: 'm2', imperial: 'ft2', default: 2, defaultImperial: 21, min: 0 },
    blockLength: { type: 'quantity', unit: 'mm', imperial: 'in', default: 600, defaultImperial: 24, min: 1 },
    blockHeight: { type: 'quantity', unit: 'mm', imperial: 'in', default: 250, defaultImperial: 8, min: 1 },
    blockThickness: { type: 'quantity', unit: 'mm', imperial: 'in', default: 300, defaultImperial: 8, min: 1 },
    reserve: { type: 'percent', default: 5, min: 0, max: 50 },
    glueRate: { type: 'number', default: 20, min: 0, max: 100 },
    glueBag: { type: 'number', default: 25, min: 1, max: 100 },
  },
  compute: (v) => blocks(v),
  outputs: {
    blocks: { type: 'integer' },
    volume: { type: 'quantity', unit: 'm3', imperial: 'ft3', digits: 2 },
    glue: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 0 },
    glueBags: { type: 'integer' },
    area: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
  },
});

export default island(def);
