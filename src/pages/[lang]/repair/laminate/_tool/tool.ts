import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Размеры комнаты — м, запас — %, площадь в упаковке — м². */
export function laminate(p: { length: number; width: number; reserve: number; pack: number }) {
  const area = p.length * p.width;
  const needed = area * (1 + p.reserve / 100);
  const packs = Math.ceil(needed / p.pack - 1e-9);
  return { packs, area, needed, bought: packs * p.pack };
}

export const def = defineCalculator({
  order: 40,
  related: ['tiles', 'paint'],
  inputs: {
    length: { type: 'number', default: 5, min: 0 },
    width: { type: 'number', default: 4, min: 0 },
    reserve: { type: 'number', default: 7, min: 0, max: 50 },
    pack: { type: 'number', default: 2.13, min: 0.1 },
  },
  compute: (v) => laminate(v),
  outputs: {
    packs: { type: 'integer' },
    area: { digits: 2 },
    needed: { digits: 2 },
    bought: { digits: 2 },
  },
});

export default island(def);
