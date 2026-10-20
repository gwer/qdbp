import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Число ± p%. Умножение до деления — меньше хвостов плавающей точки. */
export function addPercent(value: number, percent: number, sign: 1 | -1) {
  return { result: (value * (100 + sign * percent)) / 100, part: (value * percent) / 100 };
}

/**
 * Обратная задача: число уже включает +percent%, найти исходное. 1200 с надбавкой 20% — это 1000, а не 960
 * (частая ошибка: вычесть 20% от 1200).
 */
export function removePercent(value: number, percent: number) {
  const result = value / (1 + percent / 100);
  return { result, part: value - result };
}

export const def = defineCalculator({
  order: 40,
  related: ['percent-of', 'percent-change', 'what-percent'],
  inputs: {
    value: { type: 'number', default: 1000, min: 0 },
    op: { type: 'select', options: ['add', 'subtract', 'remove'], default: 'add' },
    percent: { type: 'percent', default: 20, min: 0 },
  },
  compute: ({ value, op, percent }) => (op === 'remove' ? removePercent(value, percent) : addPercent(value, percent, op === 'add' ? 1 : -1)),
  outputs: {
    result: { digits: 6 },
    part: { digits: 6 },
  },
});

export default island(def);
