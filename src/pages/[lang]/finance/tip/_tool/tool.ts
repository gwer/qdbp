import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { localizedCalculator } from '../../_shared/localized';

export function tip(bill: number, percent: number, people: number) {
  if (!Number.isInteger(people) || people < 1) throw new RangeError('people must be a positive integer');
  const amount = (bill * percent) / 100;
  const total = bill + amount;
  return { tip: amount, total, perPerson: total / people, tipPerPerson: amount / people };
}

export const base = defineCalculator({
  order: 80,
  related: ['discount', 'vat'],
  inputs: {
    bill: { type: 'number', default: 80, min: 0 },
    percent: { type: 'percent', default: 10, min: 0, max: 100 },
    people: { type: 'integer', default: 2, min: 1, max: 1000 },
  },
  compute: ({ bill, percent, people }) => tip(bill, percent, people),
  outputs: {
    perPerson: { type: 'money' },
    tip: { type: 'money' },
    total: { type: 'money' },
    tipPerPerson: { type: 'money' },
  },
});

// Нормы чаевых различаются: в США принято 15–20%, в Бразилии в счёт обычно включают 10% «serviço»,
// в России и Европе — около 10%. Суммы счёта — правдоподобные для страны языка.
export const def = localizedCalculator(base, {
  ru: { bill: 4500, percent: 10 },
  en: { bill: 80, percent: 18 },
  es: { bill: 60, percent: 10 },
  de: { bill: 60, percent: 10 },
  pt: { bill: 200, percent: 10 },
});

export default island(def);
