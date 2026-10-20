import { InputError } from '@/ui/define';
import { loan, type LoanKind, type LoanRow, type PrepayMode } from '../../_shared/loan';
import { parsePrepayments } from '../../_shared/prepayments';

export interface EarlyInput {
  amount: number;
  /** Годовая ставка, %. */
  rate: number;
  /** Срок кредита, месяцев. */
  months: number;
  kind: LoanKind;
  /** Досрочные погашения в записи поля (см. _shared/prepayments.ts). */
  prepay: string;
}

const cents = (x: number) => Math.round(x * 100) / 100;
const lastRegular = (s: readonly LoanRow[]) => (s.length > 1 ? s[s.length - 2].payment : (s[0]?.payment ?? 0));

/**
 * Кредит с досрочными погашениями против того же кредита без них.
 * mode — пересчитать, как если бы все погашения уменьшали срок или все — платёж (для сравнения вариантов).
 */
export function earlyRepayment({ amount, rate, months, kind, prepay }: EarlyInput, mode?: PrepayMode) {
  let prepayments = parsePrepayments(prepay);
  if (!prepayments.length) throw new InputError('noPrepayments');
  if (prepayments.some((p) => p.after >= months)) throw new InputError('afterTooLate');
  if (mode) prepayments = prepayments.map((p) => ({ ...p, mode }));
  const base = loan({ amount, rate, months, kind });
  const res = loan({ amount, rate, months, kind, prepayments });
  return {
    savings: cents(base.overpay - res.overpay),
    newTerm: res.schedule.length,
    termSaved: base.schedule.length - res.schedule.length,
    interestAfter: res.overpay,
    interestBefore: base.overpay,
    extraTotal: res.extraTotal,
    /** Последний полный платёж (предпоследняя строка графика): у «уменьшить платёж» он меньше исходного. */
    lastRegular: lastRegular(res.schedule),
    baseLastRegular: lastRegular(base.schedule),
    schedule: res.schedule,
    base: base.schedule,
  };
}
