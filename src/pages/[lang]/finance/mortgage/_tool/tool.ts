import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { PrepaymentsField } from '../../_shared/PrepaymentsField';
import { ByYear } from './ByYear';
import { mortgage } from './mortgage';

// Правдоподобные для рынка языка цены, ставки и сроки — это пример, а не предложения банков.
// В Бразилии ипотеку чаще всего оформляют по SAC — он и стоит по умолчанию для pt.
export const def = defineCalculator({
  order: 20,
  related: ['early-repayment', 'refinance', 'loan-calculator', 'compound-interest'],
  inputs: {
    price: { type: 'number', default: 400000, min: 1, byLang: { ru: 8000000, en: 400000, es: 250000, de: 400000, pt: 500000 } },
    down: { type: 'percent', default: 20, min: 0, max: 99, byLang: { ru: 20, en: 20, es: 20, de: 20, pt: 20 } },
    rate: { type: 'percent', default: 6.5, min: 0, max: 100, byLang: { ru: 16, en: 6.5, es: 3, de: 3.5, pt: 11 } },
    years: { type: 'integer', default: 30, min: 1, max: 50, byLang: { ru: 20, en: 30, es: 25, de: 25, pt: 30 } },
    kind: { type: 'select', options: ['annuity', 'differentiated'], default: 'annuity', byLang: { pt: 'differentiated' } },
    // Налог на недвижимость, страховка (в США — property tax, homeowners insurance, HOA) — к платежу банку.
    costs: { type: 'number', default: 0, min: 0 },
    prepay: { type: 'custom', default: '', Field: PrepaymentsField },
  },
  errors: ['prepayments'],
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

export default island(def);
