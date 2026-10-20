import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Коэффициент плотности затирки из формулы расхода производителей (Ceresit, Mapei и др.).
const GROUT_DENSITY = 1.6;

/**
 * Площадь — м², размеры плитки — см, толщина и шов — мм, запас — %, расход клея — кг/м².
 * Количество плиток считается по «модулю»: плитка плюс шов.
 */
export function tiles(p: {
  area: number;
  length: number;
  width: number;
  thickness: number;
  joint: number;
  reserve: number;
  perBox: number;
  adhesive: number;
}) {
  const a = p.length * 10; // мм
  const b = p.width * 10;
  const module = ((a + p.joint) / 1000) * ((b + p.joint) / 1000); // м²
  const pieces = Math.ceil((p.area / module) * (1 + p.reserve / 100) - 1e-9);
  // Расход затирки, кг/м² = (A + B) / (A × B) × толщина × ширина шва × 1,6 (все размеры в мм).
  const groutPerM2 = ((a + b) / (a * b)) * p.thickness * p.joint * GROUT_DENSITY;
  return {
    pieces,
    boxes: Math.ceil(pieces / p.perBox),
    grout: groutPerM2 * p.area,
    glue: p.adhesive * p.area,
  };
}

export const def = defineCalculator({
  order: 30,
  related: ['laminate', 'paint', 'wallpaper'],
  inputs: {
    area: { type: 'quantity', unit: 'm2', imperial: 'ft2', default: 10, defaultImperial: 100, min: 0 },
    length: { type: 'quantity', unit: 'cm', imperial: 'in', default: 60, defaultImperial: 24, min: 1 },
    width: { type: 'quantity', unit: 'cm', imperial: 'in', default: 30, defaultImperial: 12, min: 1 },
    thickness: { type: 'quantity', unit: 'mm', imperial: 'in', default: 9, defaultImperial: 0.375, min: 1, max: 40 },
    joint: { type: 'quantity', unit: 'mm', imperial: 'in', default: 2, defaultImperial: 0.125, min: 0, max: 20 },
    reserve: { type: 'percent', default: 10, min: 0, max: 50 },
    perBox: { type: 'integer', default: 8, min: 1 },
    // 4 кг/м² ≈ зубчатый шпатель 8 мм; в США — около 1 lb/sq ft (мешок 50 lb на 40–50 sq ft).
    adhesive: { type: 'quantity', unit: 'kg_per_m2', imperial: 'lb_per_ft2', default: 4, defaultImperial: 1, min: 0, max: 20 },
  },
  compute: (v) => tiles(v),
  outputs: {
    pieces: { type: 'integer' },
    boxes: { type: 'integer' },
    grout: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
    glue: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
  },
});

export default island(def);
