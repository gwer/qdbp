import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Round = 'no' | '1' | '10' | '100';

/**
 * Чаевые и деление счёта. round — округлить сумму с каждого вверх (до целого, до 10, до 100):
 * округление уходит в чаевые, фактический процент пересчитывается.
 */
export function tip(bill: number, percent: number, people: number, round: Round = 'no') {
  if (!Number.isInteger(people) || people < 1) throw new RangeError('people must be a positive integer');
  let perPerson = (bill * (1 + percent / 100)) / people;
  if (round !== 'no') perPerson = Math.ceil(perPerson / Number(round) - 1e-9) * Number(round);
  const total = perPerson * people;
  const amount = total - bill;
  return { tip: amount, total, perPerson, tipPerPerson: amount / people, actual: bill > 0 ? (amount / bill) * 100 : 0 };
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
    round: { type: 'select', options: ['no', '1', '10', '100'], default: 'no' },
  },
  compute: ({ bill, percent, people, round }) => tip(bill, percent, people, round),
  outputs: {
    perPerson: { type: 'money' },
    tip: { type: 'money' },
    total: { type: 'money' },
    tipPerPerson: { type: 'money' },
    actual: { type: 'percent', digits: 1, showIf: { round: ['1', '10', '100'] } },
  },
});

export default island(def);
