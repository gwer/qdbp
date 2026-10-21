import { byYear, loan, type LoanKind } from '../../_shared/loan';
import { parsePrepayments } from '../../_shared/prepayments';

export interface MortgageInput {
  price: number;
  /** Первоначальный взнос, % от стоимости. */
  down: number;
  /** Годовая ставка, %. */
  rate: number;
  years: number;
  kind: LoanKind;
  /** Налоги и страховка в год — показываются отдельно, в расчёт кредита не входят. */
  costs?: number;
  /** Досрочные погашения в записи поля (см. _shared/prepayments.ts); пусто — без них. */
  prepay?: string;
}

export function mortgage({ price, down, rate, years, kind, prepay = '' }: MortgageInput) {
  const downPayment = (price * down) / 100;
  const principal = price - downPayment;
  if (!(principal > 0)) throw new RangeError('nothing to borrow');
  const prepayments = parsePrepayments(prepay);
  const base = loan({ amount: principal, rate, months: years * 12, kind });
  const res = prepayments.length ? loan({ amount: principal, rate, months: years * 12, kind, prepayments }) : base;

  return {
    payment: res.payment,
    lastPayment: res.lastPayment,
    principal,
    downPayment,
    overpay: res.overpay,
    total: res.total,
    extraTotal: res.extraTotal,
    schedule: res.schedule,
    byYear: byYear(res.schedule, res.initialExtra),
    base,
  };
}
