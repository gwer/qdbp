import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Comparison } from './Comparison';
import { earlyRepayment } from './early';

// Правдоподобные для рынка языка суммы, ставки и сроки — это пример, а не предложения банков.
export const def = defineCalculator({
  order: 90,
  related: ['mortgage', 'loan-calculator', 'refinance'],
  inputs: {
    amount: { type: 'number', default: 300000, min: 1, byLang: { ru: 5000000, en: 300000, es: 150000, de: 200000, pt: 400000 } },
    rate: { type: 'percent', default: 7, min: 0, max: 100, byLang: { ru: 16, en: 7, es: 3, de: 3.5, pt: 11 } },
    months: { type: 'integer', default: 360, min: 2, max: 600, byLang: { ru: 240, en: 360, es: 300, de: 300, pt: 360 } },
    after: { type: 'integer', default: 24, min: 0, max: 599, byLang: { ru: 24, en: 60, es: 36, de: 36, pt: 24 } },
    extra: { type: 'number', default: 20000, min: 1, byLang: { ru: 500000, en: 20000, es: 10000, de: 10000, pt: 40000 } },
    mode: { type: 'select', options: ['term', 'payment'], default: 'term' },
  },
  errors: ['afterTooLate'],
  compute: (v) => earlyRepayment(v),
  outputs: {
    savings: { type: 'money' },
    newPayment: { type: 'money' },
    newMonths: { type: 'integer' },
    interestAfter: { type: 'money' },
  },
  Extra: Comparison,
});

export default island(def);
