import DecimalBase from 'decimal.js-light';

const Decimal = DecimalBase.clone({ precision: 40, rounding: DecimalBase.ROUND_HALF_UP });
type D = InstanceType<typeof Decimal>;
const cents = (d: D) => d.toDecimalPlaces(2);

export type LoanKind = 'annuity' | 'differentiated';

/** Что уменьшает досрочный платёж: срок (платёж прежний) или платёж (срок прежний). */
export type PrepayMode = 'term' | 'payment';
export type PrepayRepeat = 'once' | 'monthly' | 'quarterly' | 'yearly';

export interface Prepayment {
  /** После какого по счёту платежа вносится (0 — сразу после выдачи, до первого платежа). */
  after: number;
  amount: number;
  mode: PrepayMode;
  /** Разово или регулярно — с этого платежа и до конца кредита. */
  repeat: PrepayRepeat;
}

export interface LoanInput {
  amount: number;
  /** Годовая ставка, %. */
  rate: number;
  months: number;
  kind: LoanKind;
  prepayments?: readonly Prepayment[];
}

export interface LoanRow {
  n: number;
  payment: number;
  principal: number;
  interest: number;
  /** Остаток после платежа и досрочного погашения в этом месяце. */
  balance: number;
  /** Досрочное погашение после этого платежа (только если было). */
  extra?: number;
}

export interface LoanResult {
  /** Первый платёж (для аннуитета — все платежи, кроме, возможно, последнего). */
  payment: number;
  lastPayment: number;
  /** Всего выплачено, включая досрочные погашения. */
  total: number;
  overpay: number;
  /** Сумма досрочных погашений. */
  extraTotal: number;
  /** Погашение сразу после выдачи (после «платежа № 0»): в графике нет строки для него, таблицы показывают его отдельно. */
  initialExtra: number;
  schedule: LoanRow[];
}

const STEP: Record<PrepayRepeat, number> = { once: 0, monthly: 1, quarterly: 3, yearly: 12 };

const due = (p: Prepayment, n: number) =>
  n === p.after || (n > p.after && STEP[p.repeat] > 0 && (n - p.after) % STEP[p.repeat] === 0);

/** Аннуитетный платёж A·r / (1 − (1 + r)^−n), округлённый до копеек. */
function annuityPayment(amount: D, rate: number, months: number): D {
  const r = new Decimal(rate).div(100).div(12);
  return r.isZero()
    ? cents(amount.div(months))
    : cents(amount.mul(r).div(new Decimal(1).minus(new Decimal(1).div(r.plus(1).pow(months)))));
}

/** Сколько месяцев гасить остаток фиксированным аннуитетным платежом (оценка по формуле, без округлений). */
function monthsToRepay(balance: D, rate: number, payment: D): number {
  const b = balance.toNumber();
  const p = payment.toNumber();
  const r = rate / 1200;
  if (r === 0) return Math.ceil(b / p - 1e-9);
  return Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r) - 1e-9);
}

/**
 * График платежей с округлением до копеек на каждом шаге, как в банковских графиках.
 * Последний платёж корректируется так, чтобы остаток стал ровно нулём.
 *
 * Досрочное погашение вносится сразу после очередного платежа. «Срок»: платёж (у дифференцированного —
 * часть основного долга) остаётся прежним, кредит кончается раньше. «Платёж»: дата окончания прежняя,
 * платёж пересчитывается на остаток. Если в одном месяце сошлись оба варианта, пересчитывается платёж.
 */
export function loan({ amount, rate, months, kind, prepayments = [] }: LoanInput): LoanResult {
  if (!(amount > 0) || !(rate >= 0) || !Number.isInteger(months) || months < 1) {
    throw new RangeError('invalid loan input');
  }
  for (const p of prepayments) {
    if (!Number.isInteger(p.after) || p.after < 0 || !(p.amount > 0)) throw new RangeError('invalid prepayment');
  }
  const principalTotal = new Decimal(amount);
  let balance = principalTotal;
  // Номер последнего платежа по текущему графику; null — срок сократился и ещё не пересчитан.
  let end: number | null = months;
  let annuity = kind === 'annuity' ? annuityPayment(balance, rate, months) : new Decimal(0);
  let evenPrincipal = cents(principalTotal.div(months));
  let total = new Decimal(0);
  let extraTotal = new Decimal(0);

  /** Досрочные погашения после платежа n; возвращает внесённую сумму. */
  const prepay = (n: number): D => {
    const list = prepayments.filter((p) => due(p, n));
    if (!list.length || balance.isZero()) return new Decimal(0);
    let extra = list.reduce((s, p) => s.plus(p.amount), new Decimal(0));
    if (extra.gt(balance)) extra = balance;
    balance = balance.minus(extra);
    if (balance.isZero()) return extra;
    if (list.some((p) => p.mode === 'payment')) {
      end ??= n + (kind === 'annuity' ? monthsToRepay(balance.plus(extra), rate, annuity) : Math.ceil(balance.plus(extra).div(evenPrincipal).toNumber() - 1e-9));
      const left = Math.max(1, end - n);
      if (kind === 'annuity') annuity = annuityPayment(balance, rate, left);
      else evenPrincipal = cents(balance.div(left));
    } else {
      end = null;
    }
    return extra;
  };

  const schedule: LoanRow[] = [];
  const first = prepay(0);
  extraTotal = extraTotal.plus(first);
  total = total.plus(first);

  for (let n = 1; n <= months && balance.gt(0); n++) {
    // Сначала умножить на годовую ставку, потом делить: остаток × ставка / 1200 считается точно,
    // а месячная ставка ставка/1200 — бесконечная дробь, и на границе полкопейки округление «съезжало».
    const interest = cents(balance.mul(rate).div(1200));
    let principal = kind === 'annuity' ? annuity.minus(interest) : evenPrincipal;
    if (n === end || n === months || principal.gt(balance)) principal = balance;
    const payment = principal.plus(interest);
    balance = balance.minus(principal);
    total = total.plus(payment);
    const row: LoanRow = {
      n,
      payment: payment.toNumber(),
      principal: principal.toNumber(),
      interest: interest.toNumber(),
      balance: balance.toNumber(),
    };
    const extra = prepay(n);
    if (extra.gt(0)) {
      row.extra = extra.toNumber();
      row.balance = balance.toNumber();
      extraTotal = extraTotal.plus(extra);
      total = total.plus(extra);
    }
    schedule.push(row);
  }

  return {
    payment: schedule[0]?.payment ?? 0,
    lastPayment: schedule.at(-1)?.payment ?? 0,
    total: total.toNumber(),
    overpay: total.minus(principalTotal).toNumber(),
    extraTotal: extraTotal.toNumber(),
    initialExtra: first.toNumber(),
    schedule,
  };
}

export interface LoanYear {
  year: number;
  /** Выплачено за год, включая досрочные погашения. */
  paid: number;
  principal: number;
  interest: number;
  extra: number;
  balance: number;
}

/** Итоги графика по годам кредита (по 12 платежей); initialExtra — погашение до первого платежа, входит в первый год. */
export function byYear(schedule: readonly LoanRow[], initialExtra = 0): LoanYear[] {
  const years: LoanYear[] = initialExtra > 0 ? [{ year: 1, paid: initialExtra, principal: 0, interest: 0, extra: initialExtra, balance: 0 }] : [];
  for (const row of schedule) {
    const y = Math.ceil(row.n / 12);
    let cur = years[y - 1];
    if (!cur) years.push((cur = { year: y, paid: 0, principal: 0, interest: 0, extra: 0, balance: 0 }));
    cur.paid += row.payment + (row.extra ?? 0);
    cur.principal += row.principal;
    cur.interest += row.interest;
    cur.extra += row.extra ?? 0;
    cur.balance = row.balance;
  }
  const round = (x: number) => Math.round(x * 100) / 100;
  return years.map((y) => ({ ...y, paid: round(y.paid), principal: round(y.principal), interest: round(y.interest), extra: round(y.extra) }));
}
