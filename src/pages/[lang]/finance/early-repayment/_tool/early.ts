import DecimalBase from 'decimal.js-light';
import { loan, type LoanRow } from '../../_shared/loan';

const Decimal = DecimalBase.clone({ precision: 40, rounding: DecimalBase.ROUND_HALF_UP });
type D = InstanceType<typeof Decimal>;
const cents = (d: D) => d.toDecimalPlaces(2);

export type Mode = 'term' | 'payment';

export interface EarlyInput {
  amount: number;
  /** Годовая ставка, %. */
  rate: number;
  /** Срок кредита, месяцев. */
  months: number;
  /** Сколько ежемесячных платежей уже внесено до досрочного погашения. */
  after: number;
  /** Сумма досрочного платежа. */
  extra: number;
  mode: Mode;
}

/** Гасит остаток фиксированным платежом до нуля (последний платёж — остаток с процентами). */
function payDown(balance: number, rate: number, payment: number): LoanRow[] {
  const p = new Decimal(payment);
  let b = new Decimal(balance);
  const rows: LoanRow[] = [];
  for (let n = 1; b.gt(0); n++) {
    const interest = cents(b.mul(rate).div(1200)); // точно, см. _shared/loan.ts
    let principal = p.minus(interest);
    if (principal.lte(0)) throw new RangeError('payment does not cover interest');
    if (principal.gt(b)) principal = b;
    b = b.minus(principal);
    rows.push({
      n,
      payment: principal.plus(interest).toNumber(),
      principal: principal.toNumber(),
      interest: interest.toNumber(),
      balance: b.toNumber(),
    });
  }
  return rows;
}

const sumInterest = (rows: LoanRow[]) => rows.reduce((a, r) => a.plus(r.interest), new Decimal(0));

/**
 * Разовое досрочное погашение аннуитетного кредита после `after` платежей.
 * term — платёж прежний, срок короче; payment — срок прежний, платёж пересчитывается.
 * Все суммы округляются до копеек на каждом шаге, как в банковском графике.
 */
export function earlyRepayment({ amount, rate, months, after, extra, mode }: EarlyInput) {
  if (!Number.isInteger(after) || after < 0 || after >= months || !(extra > 0)) throw new RangeError('invalid input');
  const base = loan({ amount, rate, months, kind: 'annuity' });
  const paid = base.schedule.slice(0, after);
  const balance = after ? paid[after - 1].balance : amount;
  const interestPaid = sumInterest(paid);
  const left = new Decimal(balance).minus(extra);
  const remainingMonths = months - after;

  let schedule: LoanRow[] = [];
  if (left.gt(0)) {
    schedule =
      mode === 'term'
        ? payDown(left.toNumber(), rate, base.payment)
        : loan({ amount: left.toNumber(), rate, months: remainingMonths, kind: 'annuity' }).schedule;
  }
  const interestAfter = interestPaid.plus(sumInterest(schedule));
  return {
    savings: new Decimal(base.overpay).minus(interestAfter).toNumber(),
    newPayment: schedule.length ? schedule[0].payment : 0,
    newMonths: schedule.length,
    oldPayment: base.payment,
    oldMonths: remainingMonths,
    balance,
    interestBefore: base.overpay,
    interestAfter: interestAfter.toNumber(),
    schedule,
  };
}
