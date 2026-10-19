import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { localizedCalculator } from '../../_shared/localized';
import { ByYear } from './ByYear';
import { mortgage } from './mortgage';

export const base = defineCalculator({
  order: 20,
  related: ['loan-calculator', 'compound-interest'],
  inputs: {
    price: { type: 'number', default: 400000, min: 1 },
    down: { type: 'percent', default: 20, min: 0, max: 99 },
    rate: { type: 'percent', default: 6.5, min: 0, max: 100 },
    years: { type: 'integer', default: 30, min: 1, max: 50 },
    kind: { type: 'select', options: ['annuity', 'differentiated'], default: 'annuity' },
  },
  compute: (v) => mortgage(v),
  outputs: {
    payment: { type: 'money' },
    principal: { type: 'money' },
    downPayment: { type: 'money' },
    overpay: { type: 'money' },
    total: { type: 'money' },
  },
  Extra: ByYear,
});

// Правдоподобные для рынка языка цены, ставки и сроки — это пример, а не предложения банков.
// В Бразилии ипотеку чаще всего оформляют по SAC — он и стоит по умолчанию для pt.
export const def = localizedCalculator(base, {
  ru: { price: 8000000, down: 20, rate: 16, years: 20 },
  en: { price: 400000, down: 20, rate: 6.5, years: 30 },
  es: { price: 250000, down: 20, rate: 3, years: 25 },
  de: { price: 400000, down: 20, rate: 3.5, years: 25 },
  pt: { price: 500000, down: 20, rate: 11, years: 30, kind: 'differentiated' },
});

export default island(def);
