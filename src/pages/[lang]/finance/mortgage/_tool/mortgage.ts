import { loan, type LoanKind } from '../../_shared/loan';

export interface MortgageInput {
  price: number;
  /** Первоначальный взнос, % от стоимости. */
  down: number;
  /** Годовая ставка, %. */
  rate: number;
  years: number;
  kind: LoanKind;
}

export interface MortgageYear {
  year: number;
  paid: number;
  principal: number;
  interest: number;
  balance: number;
}

export function mortgage({ price, down, rate, years, kind }: MortgageInput) {
  const downPayment = (price * down) / 100;
  const principal = price - downPayment;
  if (!(principal > 0)) throw new RangeError('nothing to borrow');
  const res = loan({ amount: principal, rate, months: years * 12, kind });

  const byYear: MortgageYear[] = [];
  for (const row of res.schedule) {
    const y = Math.ceil(row.n / 12);
    let cur = byYear[y - 1];
    if (!cur) byYear.push((cur = { year: y, paid: 0, principal: 0, interest: 0, balance: 0 }));
    cur.paid += row.payment;
    cur.principal += row.principal;
    cur.interest += row.interest;
    cur.balance = row.balance;
  }
  for (const y of byYear) {
    y.paid = Math.round(y.paid * 100) / 100;
    y.principal = Math.round(y.principal * 100) / 100;
    y.interest = Math.round(y.interest * 100) / 100;
  }

  return {
    payment: res.payment,
    lastPayment: res.lastPayment,
    principal,
    downPayment,
    overpay: res.overpay,
    total: res.total,
    byYear,
  };
}
