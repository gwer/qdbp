import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Запас на подрезку полосы сверху и снизу, м (около 4 дюймов).
const TRIM = 0.1;

/**
 * Размеры комнаты, проёмов и рулона — м, раппорт — см.
 * Длина полосы = высота стены + подрезка; при раппорте она округляется вверх до целого числа раппортов,
 * чтобы рисунок совпадал на соседних полосах.
 */
export function wallpaper(p: {
  length: number;
  width: number;
  height: number;
  openings: number;
  rollWidth: number;
  rollLength: number;
  repeat: number;
}) {
  const perimeter = Math.max(0, 2 * (p.length + p.width) - p.openings);
  const strips = Math.ceil(perimeter / p.rollWidth - 1e-9);
  const repeat = p.repeat / 100;
  const base = p.height + TRIM;
  const strip = repeat > 0 ? Math.ceil(base / repeat - 1e-9) * repeat : base;
  const perRoll = Math.floor(p.rollLength / strip + 1e-9);
  if (perRoll < 1) throw new InputError('rollTooShort');
  return { rolls: Math.ceil(strips / perRoll), strips, perRoll, strip };
}

export const def = defineCalculator({
  order: 20,
  related: ['paint', 'tiles'],
  inputs: {
    length: { type: 'quantity', unit: 'm', imperial: 'ft', default: 5, defaultImperial: 16, min: 0 },
    width: { type: 'quantity', unit: 'm', imperial: 'ft', default: 4, defaultImperial: 13, min: 0 },
    height: { type: 'quantity', unit: 'm', imperial: 'ft', default: 2.7, defaultImperial: 8, min: 0 },
    openings: { type: 'quantity', unit: 'm', imperial: 'ft', default: 2.2, defaultImperial: 6, min: 0 },
    // Европейский рулон 0,53 × 10,05 м; в США — «double roll» 20,5 in × 33 ft (около 56 sq ft).
    rollWidth: { type: 'quantity', unit: 'm', imperial: 'in', default: 0.53, defaultImperial: 20.5, min: 0.1 },
    rollLength: { type: 'quantity', unit: 'm', imperial: 'ft', default: 10.05, defaultImperial: 33, min: 0.5 },
    repeat: { type: 'quantity', unit: 'cm', imperial: 'in', default: 0, defaultImperial: 0, min: 0, max: 200 },
  },
  errors: ['rollTooShort'],
  compute: (v) => wallpaper(v),
  outputs: {
    rolls: { type: 'integer' },
    strips: { type: 'integer' },
    perRoll: { type: 'integer' },
    strip: { type: 'quantity', unit: 'm', imperial: 'ft', digits: 2 },
  },
});

export default island(def);
