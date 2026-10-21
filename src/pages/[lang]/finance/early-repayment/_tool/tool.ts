import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { formatTerm } from '../../_shared/LoanParts';
import { PrepaymentsField } from '../../_shared/PrepaymentsField';
import { Comparison } from './Comparison';
import { earlyRepayment } from './early';

/** Одно погашение старой ссылки в записи поля. */
export const legacyPrepay = (after: number, extra: number, mode: string) => `${after}:${extra}:${mode}:once`;

const term = (m: number, { t }: FormatContext) => (m > 0 ? formatTerm(t, m) : '—');

// Правдоподобные для рынка языка суммы, ставки и сроки — это пример, а не предложения банков.
// Погашение по умолчанию — разовое, после двух-пяти лет платежей, с сокращением срока.
export const def = defineCalculator({
  order: 90,
  related: ['mortgage', 'loan-calculator', 'refinance'],
  inputs: {
    amount: { type: 'number', default: 300000, min: 1, byLang: { ru: 5000000, en: 300000, es: 150000, de: 200000, pt: 400000 } },
    rate: { type: 'percent', default: 7, min: 0, max: 100, byLang: { ru: 16, en: 7, es: 3, de: 3.5, pt: 11 } },
    months: { type: 'integer', default: 360, min: 2, max: 600, byLang: { ru: 240, en: 360, es: 300, de: 300, pt: 360 } },
    kind: { type: 'select', options: ['annuity', 'differentiated'], default: 'annuity' },
    prepay: {
      type: 'custom',
      default: '60:20000:term:once',
      byLang: { ru: '24:500000:term:once', es: '36:10000:term:once', de: '36:10000:term:once', pt: '24:40000:term:once' },
      Field: PrepaymentsField,
    },
  },
  errors: ['afterTooLate', 'noPrepayments', 'prepayments'],
  compute: (v) => earlyRepayment(v),
  outputs: {
    savings: { type: 'money' },
    termSaved: { type: 'custom', format: term },
    newTerm: { type: 'custom', format: term },
    interestAfter: { type: 'money' },
  },
  Extra: Comparison,
  // До 2026-10-21 погашение было одно: ?after=24&extra=500000&mode=term.
  legacy: (params) => {
    // Пустая строка или пробелы для Number() — это 0, а «Infinity» и 1e309 — бесконечность: такое не переносим.
    const rawAfter = params.get('after')?.trim() ?? '';
    const rawExtra = params.get('extra')?.trim() ?? '';
    const after = Number(rawAfter);
    const extra = Number(rawExtra);
    const mode = params.get('mode') ?? 'term';
    const valid =
      rawAfter !== '' && rawExtra !== '' && Number.isInteger(after) && after >= 0 && Number.isFinite(extra) && extra > 0 && (mode === 'term' || mode === 'payment');
    return valid ? { prepay: legacyPrepay(after, extra, mode) } : {};
  },
});

export default island(def);
