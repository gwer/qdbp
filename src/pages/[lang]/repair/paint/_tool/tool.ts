import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Surface = 'walls' | 'wallsCeiling' | 'ceiling';

/** Все размеры — в метрах, проёмы — м², расход — л/м² на один слой, банка — л. */
export function paint(p: {
  length: number;
  width: number;
  height: number;
  openings: number;
  surface: Surface;
  coats: number;
  rate: number;
  can: number;
}) {
  const walls = Math.max(0, 2 * (p.length + p.width) * p.height - p.openings);
  const ceiling = p.length * p.width;
  const area = p.surface === 'walls' ? walls : p.surface === 'ceiling' ? ceiling : walls + ceiling;
  const liters = area * p.coats * p.rate;
  return { liters, cans: Math.ceil(liters / p.can - 1e-9), area };
}

export const def = defineCalculator({
  order: 10,
  related: ['wallpaper', 'tiles'],
  inputs: {
    length: { type: 'number', default: 5, min: 0 },
    width: { type: 'number', default: 4, min: 0 },
    height: { type: 'number', default: 2.7, min: 0 },
    openings: { type: 'number', default: 3.7, min: 0 },
    surface: { type: 'select', options: ['walls', 'wallsCeiling', 'ceiling'], default: 'walls' },
    coats: { type: 'integer', default: 2, min: 1, max: 10 },
    rate: { type: 'number', default: 0.12, min: 0.01, max: 2 },
    can: { type: 'number', default: 2.5, min: 0.1 },
  },
  compute: (v) => paint(v),
  outputs: {
    liters: { digits: 1 },
    cans: { type: 'integer' },
    area: { digits: 2 },
  },
});

export default island(def);
