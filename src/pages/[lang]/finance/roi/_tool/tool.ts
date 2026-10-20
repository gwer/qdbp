import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** ROI и среднегодовая доходность (CAGR). invested > 0, returned ≥ 0, years > 0. */
export function roi(invested: number, returned: number, years: number) {
  if (!(invested > 0) || !(years > 0) || returned < 0) throw new RangeError('invalid input');
  return {
    profit: returned - invested,
    roi: ((returned - invested) / invested) * 100,
    cagr: ((returned / invested) ** (1 / years) - 1) * 100,
  };
}

export const def = defineCalculator({
  order: 100,
  related: ['compound-interest', 'break-even', 'inflation'],
  inputs: {
    invested: { type: 'number', default: 10000, min: 0.01, byLang: { ru: 100000 } },
    returned: { type: 'number', default: 15000, min: 0, byLang: { ru: 150000 } },
    years: { type: 'number', default: 3, min: 0.01, max: 200 },
  },
  compute: ({ invested, returned, years }) => roi(invested, returned, years),
  outputs: {
    roi: { type: 'percent' },
    cagr: { type: 'percent' },
    profit: { type: 'money' },
  },
});

export default island(def);
