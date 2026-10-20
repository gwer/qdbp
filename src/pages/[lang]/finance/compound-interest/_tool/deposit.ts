import DecimalBase from 'decimal.js-light';

const Decimal = DecimalBase.clone({ precision: 40, rounding: DecimalBase.ROUND_HALF_UP });

export type Capitalization = 'monthly' | 'quarterly' | 'yearly';
const MONTHS_PER_PERIOD: Record<Capitalization, number> = { monthly: 1, quarterly: 3, yearly: 12 };

export interface DepositInput {
  initial: number;
  /** Пополнение в конце каждого месяца. */
  monthly: number;
  /** Годовая ставка, %. */
  rate: number;
  years: number;
  cap: Capitalization;
  /** Ежегодное увеличение пополнения, % (с ростом дохода): со второго года пополнение больше на эту долю. */
  increase?: number;
}

export interface DepositYear {
  year: number;
  contributed: number;
  interest: number;
  balance: number;
}

/**
 * Проценты начисляются каждый месяц на текущий остаток (ставка / 12) и прибавляются к вкладу
 * в конце периода капитализации; пополнение — в конце месяца, после начисления.
 * При ежеквартальной и ежегодной капитализации это даёт ровно (1 + r/4)^(4t) и (1 + r)^t.
 */
export function deposit({ initial, monthly, rate, years, cap, increase = 0 }: DepositInput) {
  if (!(initial >= 0) || !(monthly >= 0) || !(rate >= 0) || !Number.isInteger(years) || years < 1) {
    throw new RangeError('invalid deposit input');
  }
  const r = new Decimal(rate).div(100).div(12);
  const step = MONTHS_PER_PERIOD[cap];
  let balance = new Decimal(initial);
  let accrued = new Decimal(0);
  let contributed = new Decimal(initial);
  const byYear: DepositYear[] = [];

  for (let m = 1; m <= years * 12; m++) {
    accrued = accrued.plus(balance.mul(r));
    if (m % step === 0) {
      balance = balance.plus(accrued);
      accrued = new Decimal(0);
    }
    const add = new Decimal(monthly).mul(new Decimal(1).plus(new Decimal(increase).div(100)).pow(Math.floor((m - 1) / 12))).toDecimalPlaces(2);
    balance = balance.plus(add);
    contributed = contributed.plus(add);
    if (m % 12 === 0) {
      byYear.push({
        year: m / 12,
        contributed: contributed.toDecimalPlaces(2).toNumber(),
        interest: balance.minus(contributed).toDecimalPlaces(2).toNumber(),
        balance: balance.toDecimalPlaces(2).toNumber(),
      });
    }
  }
  const last = byYear[byYear.length - 1];
  return { total: last.balance, contributed: last.contributed, interest: last.interest, byYear };
}
