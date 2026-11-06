import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { loan, type LoanKind } from '../../_shared/loan';
import { parsePrepayments } from '../../_shared/prepayments';
import { PrepaymentsField } from '../../_shared/PrepaymentsField';
import { Schedule } from '../../_shared/Schedule';

export interface LoanCalcInput {
  amount: number;
  rate: number;
  months: number;
  kind: LoanKind;
  /** Досрочные погашения в записи поля (см. _shared/prepayments.ts). */
  prepay: string;
}

/** График с досрочными погашениями; base — тот же кредит без них, для сравнения. */
export function loanWithPrepayments({ prepay, ...v }: LoanCalcInput) {
  const prepayments = parsePrepayments(prepay);
  const base = loan(v);
  return prepayments.length ? { ...loan({ ...v, prepayments }), base } : { ...base, base };
}

export const def = defineCalculator({
  order: 10,
  related: ['early-repayment', 'refinance', 'auto-loan', 'percent-of'],
  inputs: {
    // Как в примерах статей: правдоподобные для рынка языка сумма, ставка и срок.
    amount: { type: 'number', default: 500000, min: 1, byLang: { en: 25000, de: 15000, es: 20000, pt: 30000 } },
    rate: { type: 'percent', default: 12, min: 0, max: 100, byLang: { en: 7, de: 6, es: 8, pt: 24 } },
    months: { type: 'integer', default: 60, min: 1, max: 600, byLang: { pt: 36 } },
    kind: { type: 'select', options: ['annuity', 'differentiated'], default: 'annuity' },
    prepay: { type: 'custom', default: '', Field: PrepaymentsField },
  },
  errors: ['prepayments'],
  compute: (v) => loanWithPrepayments(v),
  outputs: {
    payment: { type: 'money' },
    overpay: { type: 'money' },
    total: { type: 'money' },
  },
  Extra: Schedule,
});

export default island(def);
