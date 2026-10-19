import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Сначала умножение, потом деление: 30 * 100 / 150 = 20 ровно, а 30 / 150 * 100 = 20.000000000000004.
export function whatPercent(part: number, whole: number) {
  if (whole === 0) throw new RangeError('whole is zero');
  return { percent: (part * 100) / whole };
}

export const def = defineCalculator({
  order: 20,
  related: ['percent-of', 'percent-change', 'proportion'],
  inputs: {
    part: { type: 'number', default: 30, min: 0 },
    whole: { type: 'number', default: 150, min: 0 },
  },
  compute: ({ part, whole }) => whatPercent(part, whole),
  outputs: { percent: { type: 'percent', digits: 4 } },
});

export default island(def);
