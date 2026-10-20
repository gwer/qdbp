import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ByYear } from './ByYear';
import { deposit } from './deposit';

// Правдоподобные для страны языка суммы и ставки — это пример, а не текущие ставки банков.
export const def = defineCalculator({
  order: 30,
  related: ['inflation', 'roi', 'loan-calculator', 'mortgage'],
  inputs: {
    initial: { type: 'number', default: 10000, min: 0, byLang: { ru: 100000, en: 10000, es: 10000, de: 10000, pt: 10000 } },
    monthly: { type: 'number', default: 200, min: 0, byLang: { ru: 10000, en: 200, es: 200, de: 200, pt: 500 } },
    rate: { type: 'percent', default: 5, min: 0, max: 100, byLang: { ru: 12, en: 5, es: 3, de: 3, pt: 10 } },
    years: { type: 'integer', default: 10, min: 1, max: 100, byLang: { ru: 3, en: 10, es: 10, de: 10, pt: 10 } },
    cap: { type: 'select', options: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    increase: { type: 'percent', default: 0, min: 0, max: 100 },
  },
  compute: (v) => deposit(v),
  outputs: {
    total: { type: 'money' },
    contributed: { type: 'money' },
    interest: { type: 'money' },
  },
  Extra: ByYear,
});

export default island(def);
