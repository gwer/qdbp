import DecimalBase from 'decimal.js-light';

const Decimal = DecimalBase.clone({ precision: 40, rounding: DecimalBase.ROUND_HALF_UP });
type D = InstanceType<typeof Decimal>;
const cents = (d: D) => d.toDecimalPlaces(2);

export type LoanKind = 'annuity' | 'differentiated';

export interface LoanInput {
  amount: number;
  /** Годовая ставка, %. */
  rate: number;
  months: number;
  kind: LoanKind;
}

export interface LoanRow {
  n: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  /** Первый платёж (для аннуитета — все платежи, кроме, возможно, последнего). */
  payment: number;
  lastPayment: number;
  total: number;
  overpay: number;
  schedule: LoanRow[];
}

/**
 * График платежей с округлением до копеек на каждом шаге, как в банковских графиках.
 * Последний платёж корректируется так, чтобы остаток стал ровно нулём.
 */
export function loan({ amount, rate, months, kind }: LoanInput): LoanResult {
  if (!(amount > 0) || !(rate >= 0) || !Number.isInteger(months) || months < 1) {
    throw new RangeError('invalid loan input');
  }
  const principalTotal = new Decimal(amount);
  const r = new Decimal(rate).div(100).div(12);

  let annuity = new Decimal(0);
  if (kind === 'annuity') {
    annuity = r.isZero()
      ? cents(principalTotal.div(months))
      : cents(principalTotal.mul(r).div(new Decimal(1).minus(new Decimal(1).div(r.plus(1).pow(months)))));
  }
  const evenPrincipal = cents(principalTotal.div(months));

  const schedule: LoanRow[] = [];
  let balance = principalTotal;
  let total = new Decimal(0);

  for (let n = 1; n <= months; n++) {
    const interest = cents(balance.mul(r));
    let principal = kind === 'annuity' ? annuity.minus(interest) : evenPrincipal;
    if (n === months || principal.gt(balance)) principal = balance;
    const payment = principal.plus(interest);
    balance = balance.minus(principal);
    total = total.plus(payment);
    schedule.push({
      n,
      payment: payment.toNumber(),
      principal: principal.toNumber(),
      interest: interest.toNumber(),
      balance: balance.toNumber(),
    });
    if (balance.isZero()) break;
  }

  return {
    payment: schedule[0].payment,
    lastPayment: schedule[schedule.length - 1].payment,
    total: total.toNumber(),
    overpay: total.minus(principalTotal).toNumber(),
    schedule,
  };
}
