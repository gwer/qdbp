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
}) {
  const area = Math.max(0, p.length * p.height - p.openings);
  const face = (p.blockLength / 1000) * (p.blockHeight / 1000);
  const count = Math.ceil((area / face) * (1 + p.reserve / 100) - 1e-9);
  return { blocks: count, volume: count * face * (p.blockThickness / 1000), area };
}

export const def = defineCalculator({
  order: 70,
  related: ['bricks', 'concrete'],
  inputs: {
    length: { type: 'number', default: 6, min: 0 },
    height: { type: 'number', default: 2.7, min: 0 },
    openings: { type: 'number', default: 2, min: 0 },
    blockLength: { type: 'number', default: 600, min: 1 },
    blockHeight: { type: 'number', default: 250, min: 1 },
    blockThickness: { type: 'number', default: 300, min: 1 },
    reserve: { type: 'number', default: 5, min: 0, max: 50 },
  },
  compute: (v) => blocks(v),
  outputs: {
    blocks: { type: 'integer' },
    volume: { digits: 2 },
    area: { digits: 2 },
  },
});

export default island(def);
