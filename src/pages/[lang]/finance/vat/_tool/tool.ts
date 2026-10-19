import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { localizedCalculator } from '../../_shared/localized';

/** add — начислить налог на сумму без налога; remove — выделить налог из суммы с налогом. */
export function vat(amount: number, rate: number, mode: 'add' | 'remove') {
  if (mode === 'add') {
    const tax = (amount * rate) / 100;
    return { vat: tax, net: amount, gross: amount + tax };
  }
  const net = amount / (1 + rate / 100);
  return { vat: amount - net, net, gross: amount };
}

export const base = defineCalculator({
  order: 70,
  related: ['markup', 'margin', 'discount'],
  inputs: {
    amount: { type: 'number', default: 1000, min: 0 },
    rate: { type: 'percent', default: 20, min: 0, max: 100 },
    mode: { type: 'select', options: ['add', 'remove'], default: 'add' },
  },
  compute: ({ amount, rate, mode }) => vat(amount, rate, mode),
  outputs: {
    vat: { type: 'money' },
    net: { type: 'money' },
    gross: { type: 'money' },
  },
});

// Основная ставка по умолчанию — для страны языка (ru — Россия с 01.01.2026, en — Великобритания,
// es — Испания, de — Германия, pt — Португалия). Пользователь всегда может ввести свою.
export const def = localizedCalculator(base, {
  ru: { rate: 22 },
  en: { rate: 20 },
  es: { rate: 21 },
  de: { rate: 19 },
  pt: { rate: 23 },
});

export default island(def);
