import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { loan } from '../../_shared/loan';
import { Schedule } from '../../_shared/Schedule';

export interface AutoInput {
  price: number;
  down: number;
  tradeIn: number;
  /** Остаток кредита за сдаваемую машину: дилер гасит его и добавляет к новому кредиту. */
  owed?: number;
  /** Налог с продажи, % — начисляется на цену за вычетом trade-in (так считают в большинстве штатов США). */
  tax: number;
  fees: number;
  rate: number;
  months: number;
}

/** Налог и сборы включаются в кредит; первоначальный взнос и trade-in уменьшают его. */
export function autoLoan({ price, down, tradeIn, owed = 0, tax, fees, rate, months }: AutoInput) {
  const taxable = Math.max(0, price - tradeIn);
  const financed = taxable + (taxable * tax) / 100 + fees + owed - down;
  if (!(financed > 0)) throw new RangeError('nothing to finance');
  const l = loan({ amount: financed, rate, months, kind: 'annuity' });
  return { ...l, financed, totalCost: l.total + down };
}

// Правдоподобные для рынка суммы и ставки — пример, а не предложения банков.
export const def = defineCalculator({
  order: 120,
  related: ['loan-calculator', 'early-repayment', 'refinance'],
  inputs: {
    price: { type: 'number', default: 35000, min: 1, byLang: { ru: 2500000, es: 25000, de: 30000, pt: 100000 } },
    down: { type: 'number', default: 5000, min: 0, byLang: { ru: 500000, es: 5000, de: 6000, pt: 20000 } },
    tradeIn: { type: 'number', default: 0, min: 0 },
    owed: { type: 'number', default: 0, min: 0 },
    tax: { type: 'percent', default: 0, min: 0, max: 50, byLang: { en: 7 } },
    fees: { type: 'number', default: 0, min: 0, byLang: { en: 500 } },
    rate: { type: 'percent', default: 7, min: 0, max: 100, byLang: { ru: 18, en: 7, es: 8, de: 6, pt: 24 } },
    months: { type: 'integer', default: 60, min: 1, max: 120, byLang: { pt: 48 } },
  },
  compute: (v) => autoLoan(v),
  outputs: {
    payment: { type: 'money' },
    financed: { type: 'money' },
    overpay: { type: 'money' },
    totalCost: { type: 'money' },
  },
  Extra: (p) => Schedule({ ...p, values: { kind: 'annuity' } }),
});

export default island(def);
