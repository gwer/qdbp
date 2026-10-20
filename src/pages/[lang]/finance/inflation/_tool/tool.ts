import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Инфляция по заданной среднегодовой ставке (без исторических данных). */
export function inflation(amount: number, rate: number, years: number) {
  if (rate <= -100 || years < 0) throw new RangeError('invalid input');
  const factor = (1 + rate / 100) ** years;
  return { future: amount * factor, power: amount / factor, loss: (1 - 1 / factor) * 100 };
}

export const def = defineCalculator({
  order: 140,
  related: ['compound-interest', 'roi'],
  inputs: {
    amount: { type: 'number', default: 1000, min: 0, byLang: { ru: 100000 } },
    rate: { type: 'percent', default: 3, min: -50, max: 1000, byLang: { ru: 8, de: 2.5, pt: 4.5 } },
    years: { type: 'number', default: 10, min: 0, max: 200 },
  },
  compute: ({ amount, rate, years }) => inflation(amount, rate, years),
  outputs: {
    future: { type: 'money' },
    power: { type: 'money' },
    loss: { type: 'percent' },
  },
});

export default island(def);
