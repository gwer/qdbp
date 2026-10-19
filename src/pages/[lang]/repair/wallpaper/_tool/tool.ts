import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Запас на подрезку полосы сверху и снизу, м.
const TRIM = 0.1;

/**
 * Размеры комнаты, проёмов и рулона — в метрах, раппорт — в сантиметрах.
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
  if (perRoll < 1) throw new RangeError('wall is higher than a roll');
  return { rolls: Math.ceil(strips / perRoll), strips, perRoll, strip };
}

export const def = defineCalculator({
  order: 20,
  related: ['paint', 'tiles'],
  inputs: {
    length: { type: 'number', default: 5, min: 0 },
    width: { type: 'number', default: 4, min: 0 },
    height: { type: 'number', default: 2.7, min: 0 },
    openings: { type: 'number', default: 2.2, min: 0 },
    rollWidth: { type: 'number', default: 0.53, min: 0.1 },
    rollLength: { type: 'number', default: 10.05, min: 0.5 },
    repeat: { type: 'number', default: 0, min: 0, max: 200 },
  },
  compute: (v) => wallpaper(v),
  outputs: {
    rolls: { type: 'integer' },
    strips: { type: 'integer' },
    perRoll: { type: 'integer' },
    strip: { digits: 2 },
  },
});

export default island(def);
