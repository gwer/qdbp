import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Размеры комнаты — м, запас — %, площадь в упаковке — м². */
export function laminate(p: { length: number; width: number; reserve: number; pack: number; doors?: number; plinth?: number }) {
  const area = p.length * p.width;
  const needed = area * (1 + p.reserve / 100);
  const packs = Math.ceil(needed / p.pack - 1e-9);
  // Плинтус — по периметру комнаты без дверных проёмов, планками целиком (обрезки — в запас на углы).
  const plinthLength = Math.max(0, 2 * (p.length + p.width) - (p.doors ?? 0));
  const plinths = p.plinth ? Math.ceil(plinthLength / p.plinth - 1e-9) : 0;
  return { packs, area, needed, bought: packs * p.pack, plinthLength, plinths };
}

export const def = defineCalculator({
  order: 40,
  related: ['tiles', 'paint'],
  inputs: {
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 5, defaultImperial: 16, min: 0 },
    width: { type: 'quantity', unit: 'm', imperial: 'ft', default: 4, defaultImperial: 13, min: 0 },
    // Запас: прямая укладка — 5–7%, диагональная — 10–15% (больше подрезки).
    layout: { type: 'select', options: ['straight', 'diagonal'], default: 'straight' },
    reserve: { type: 'percent', default: 7, min: 0, max: 50, defaultBy: { layout: { straight: 7, diagonal: 15 } } },
    pack: { type: 'quantity', unit: 'm2', imperial: 'ft2', default: 2.13, defaultImperial: 20, min: 0.1 },
    doors: { type: 'quantity', unit: 'm', imperial: 'ft', default: 0.8, defaultImperial: 3, min: 0 },
    // Планка плинтуса: 2,5 м (Европа, Россия), в США — 8 ft.
    plinth: { type: 'quantity', unit: 'm', imperial: 'ft', default: 2.5, defaultImperial: 8, min: 0.1 },
  },
  compute: (v) => laminate(v),
  outputs: {
    packs: { type: 'integer' },
    area: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
    needed: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
    bought: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 2 },
    plinthLength: { type: 'quantity', unit: 'm', imperial: 'ft', digits: 2 },
    plinths: { type: 'integer' },
  },
});

export default island(def);
