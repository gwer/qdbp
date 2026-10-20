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
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 5, defaultImperial: 16, min: 0 },
    width: { type: 'quantity', unit: 'm', imperial: 'ft', default: 4, defaultImperial: 13, min: 0 },
    reserve: { type: 'percent', default: 7, min: 0, max: 50 },
    pack: { type: 'quantity', unit: 'm2', imperial: 'ft2', default: 2.13, defaultImperial: 20, min: 0.1 },
  },
  compute: (v) => laminate(v),
  outputs: {
    packs: { type: 'integer' },
    area: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
    needed: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
    bought: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
  },
});

export default island(def);
