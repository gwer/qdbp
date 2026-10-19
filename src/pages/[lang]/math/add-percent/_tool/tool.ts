import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Число ± p%. Умножение до деления — меньше хвостов плавающей точки. */
export function addPercent(value: number, percent: number, sign: 1 | -1) {
  return { result: (value * (100 + sign * percent)) / 100, part: (value * percent) / 100 };
}

export const def = defineCalculator({
  order: 40,
  related: ['percent-of', 'percent-change', 'what-percent'],
  inputs: {
    value: { type: 'number', default: 1000, min: 0 },
    op: { type: 'select', options: ['add', 'subtract'], default: 'add' },
    percent: { type: 'percent', default: 20, min: 0 },
  },
  compute: ({ value, op, percent }) => addPercent(value, percent, op === 'add' ? 1 : -1),
  outputs: {
    result: { digits: 6 },
    part: { digits: 6 },
  },
});

export default island(def);
