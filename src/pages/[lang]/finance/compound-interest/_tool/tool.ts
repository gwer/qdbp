import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { localizedCalculator } from '../../_shared/localized';
import { ByYear } from './ByYear';
import { deposit } from './deposit';

export const base = defineCalculator({
  order: 30,
  related: ['loan-calculator', 'mortgage'],
  inputs: {
    initial: { type: 'number', default: 10000, min: 0 },
    monthly: { type: 'number', default: 200, min: 0 },
    rate: { type: 'percent', default: 5, min: 0, max: 100 },
    years: { type: 'integer', default: 10, min: 1, max: 100 },
    cap: { type: 'select', options: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  },
  compute: (v) => deposit(v),
  outputs: {
    total: { type: 'money' },
    contributed: { type: 'money' },
    interest: { type: 'money' },
  },
  Extra: ByYear,
});

// Правдоподобные для страны языка суммы и ставки — это пример, а не текущие ставки банков.
export const def = localizedCalculator(base, {
  ru: { initial: 100000, monthly: 10000, rate: 12, years: 3 },
  en: { initial: 10000, monthly: 200, rate: 5, years: 10 },
  es: { initial: 10000, monthly: 200, rate: 3, years: 10 },
  de: { initial: 10000, monthly: 200, rate: 3, years: 10 },
  pt: { initial: 10000, monthly: 500, rate: 10, years: 10 },
});

export default island(def);
