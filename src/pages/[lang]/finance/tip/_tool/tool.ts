import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export function tip(bill: number, percent: number, people: number) {
  if (!Number.isInteger(people) || people < 1) throw new RangeError('people must be a positive integer');
  const amount = (bill * percent) / 100;
  const total = bill + amount;
  return { tip: amount, total, perPerson: total / people, tipPerPerson: amount / people };
}

// Нормы чаевых различаются: в США принято 15–20%, в Бразилии в счёт обычно включают 10% «serviço»,
// в России и Европе — около 10%. Суммы счёта — правдоподобные для страны языка.
export const def = defineCalculator({
  order: 80,
  related: ['discount', 'vat'],
  inputs: {
    bill: { type: 'number', default: 80, min: 0, byLang: { ru: 4500, en: 80, es: 60, de: 60, pt: 200 } },
    percent: { type: 'percent', default: 10, min: 0, max: 100, byLang: { ru: 10, en: 18, es: 10, de: 10, pt: 10 } },
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

export default island(def);
