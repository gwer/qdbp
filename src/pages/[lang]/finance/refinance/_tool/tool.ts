import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { loan } from '../../_shared/loan';
import { Compare } from './Compare';

export interface RefinanceInput {
  balance: number;
  rate: number;
  months: number;
  newRate: number;
  newMonths: number;
  /** Расходы на рефинансирование, оплачиваемые сразу (комиссии, оценка, страховка и т. п.). */
  fees: number;
}

/**
 * Сравнение текущего кредита и нового на ту же сумму остатка.
 * Чистая выгода = проценты по текущему − проценты по новому − расходы.
 * Окупаемость — через сколько месяцев экономия на платеже покроет расходы.
 */
export function refinance({ balance, rate, months, newRate, newMonths, fees }: RefinanceInput) {
  const current = loan({ amount: balance, rate, months, kind: 'annuity' });
  const next = loan({ amount: balance, rate: newRate, months: newMonths, kind: 'annuity' });
  const monthlySaving = current.payment - next.payment;
  const netSavings = current.overpay - next.overpay - fees;
  return {
    monthlySaving,
    newPayment: next.payment,
    currentPayment: current.payment,
    netSavings,
    // 0 — окупается сразу (расходов нет), −1 — платёж не снижается, −2 — платёж ниже, но из-за срока
    // и расходов в сумме выйдет дороже: экономия в месяц тогда обманчива.
    breakEven: netSavings <= 0 && monthlySaving > 0 ? -2 : fees <= 0 ? 0 : monthlySaving > 0 ? Math.ceil(fees / monthlySaving - 1e-9) : -1,
    current: { payment: current.payment, months, interest: current.overpay, fees: 0, total: current.total },
    next: { payment: next.payment, months: newMonths, interest: next.overpay, fees, total: next.total + fees },
  };
}

// Правдоподобные для рынка суммы и ставки — пример, а не предложения банков.
export const def = defineCalculator({
  order: 130,
  related: ['early-repayment', 'mortgage', 'loan-calculator'],
  inputs: {
    balance: { type: 'number', default: 250000, min: 1, byLang: { ru: 3000000, es: 150000, de: 200000, pt: 300000 } },
    rate: { type: 'percent', default: 7.5, min: 0, max: 100, byLang: { ru: 18, es: 4, de: 4.5, pt: 12 } },
    months: { type: 'integer', default: 300, min: 1, max: 600, byLang: { ru: 180, es: 240, de: 240 } },
    newRate: { type: 'percent', default: 6, min: 0, max: 100, byLang: { ru: 14, es: 3, de: 3.5, pt: 10 } },
    newMonths: { type: 'integer', default: 300, min: 1, max: 600, byLang: { ru: 180, es: 240, de: 240 } },
    fees: { type: 'number', default: 4000, min: 0, byLang: { ru: 30000, es: 1500, de: 2000, pt: 3000 } },
  },
  compute: (v) => refinance(v),
  outputs: {
    netSavings: { type: 'money' },
    monthlySaving: { type: 'money' },
    newPayment: { type: 'money' },
    currentPayment: { type: 'money' },
    breakEven: {
      type: 'custom',
      format: (m: number, { t }: FormatContext) =>
        m === 0 ? t('ui.instant') : m === -1 ? t('ui.never') : m === -2 ? t('ui.neverTotal') : t('ui.months', { count: m }),
    },
  },
  Extra: Compare,
});

export default island(def);
