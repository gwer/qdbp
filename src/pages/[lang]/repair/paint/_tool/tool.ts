import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Surface = 'walls' | 'wallsCeiling' | 'ceiling';

/** Размеры — м, проёмы — м², покрытие — м² на литр за один слой, банка — л. */
export function paint(p: {
  length: number;
  width: number;
  height: number;
  openings: number;
  surface: Surface;
  coats: number;
  coverage: number;
  can: number;
}) {
  const walls = Math.max(0, 2 * (p.length + p.width) * p.height - p.openings);
  const ceiling = p.length * p.width;
  const area = p.surface === 'walls' ? walls : p.surface === 'ceiling' ? ceiling : walls + ceiling;
  const liters = (area * p.coats) / p.coverage;
  return { liters, cans: Math.ceil(liters / p.can - 1e-9), area };
}

export const def = defineCalculator({
  order: 10,
  related: ['wallpaper', 'tiles'],
  inputs: {
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 5, defaultImperial: 16, min: 0 },
    width: { type: 'quantity', unit: 'm', imperial: 'ft', default: 4, defaultImperial: 13, min: 0 },
    height: { type: 'quantity', unit: 'm', imperial: 'ft', default: 2.7, defaultImperial: 8, min: 0 },
    openings: { type: 'quantity', unit: 'm2', imperial: 'ft2', default: 3.7, defaultImperial: 36, min: 0 },
    surface: { type: 'select', options: ['walls', 'wallsCeiling', 'ceiling'], default: 'walls' },
    coats: { type: 'integer', default: 2, min: 1, max: 10 },
    // ≈ 0,12 л/м²; в США на банках обычно 350–400 sq ft/gal.
    coverage: { type: 'quantity', unit: 'm2_per_l', imperial: 'ft2_per_gal', default: 8.3, defaultImperial: 350, min: 0.5, max: 50 },
    can: {
      type: 'quantity',
      unit: 'l',
      imperial: 'gal',
      default: 2.5,
      defaultImperial: 1,
      min: 0.1,
      byLang: { ru: 2.5, de: 10, es: 4, pt: 3.6 },
    },
  },
  compute: (v) => paint(v),
  outputs: {
    liters: { type: 'quantity', unit: 'l', imperial: 'gal', digits: 1 },
    cans: { type: 'integer' },
    area: { type: 'quantity', unit: 'm2', imperial: 'ft2', digits: 1 },
  },
});

export default island(def);
