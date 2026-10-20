import { describe, expect, it } from 'vitest';
import { loan } from './loan';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('loan: аннуитет', () => {
  const res = loan({ amount: 1_000_000, rate: 12, months: 60, kind: 'annuity' });

  it('платёж совпадает с формулой A·r / (1 − (1 + r)^−n)', () => {
    expect(res.payment).toBe(22244.45);
  });

  it('тело долга гасится полностью', () => {
    expect(res.schedule).toHaveLength(60);
    expect(res.schedule.at(-1)!.balance).toBe(0);
    expect(sum(res.schedule.map((r) => r.principal))).toBeCloseTo(1_000_000, 2);
  });

  it('переплата ≈ n·P − A, расхождение только из-за округления последнего платежа', () => {
    expect(Math.abs(res.overpay - (22244.45 * 60 - 1_000_000))).toBeLessThan(1);
  });

  it('первый месяц: проценты = A·r', () => {
    expect(res.schedule[0].interest).toBe(10000);
    expect(res.schedule[0].principal).toBe(12244.45);
  });
});

describe('loan: дифференцированный', () => {
  const res = loan({ amount: 1_000_000, rate: 12, months: 60, kind: 'differentiated' });

  it('первый платёж = A/n + A·r', () => {
    expect(res.payment).toBe(26666.67);
  });

  it('переплата = A·r·(n + 1) / 2 с точностью до копеек', () => {
    expect(res.overpay).toBeCloseTo(305_000, 0);
  });

  it('последний платёж меньше первого, остаток нулевой', () => {
    expect(res.lastPayment).toBeLessThan(res.payment);
    expect(res.schedule.at(-1)!.balance).toBe(0);
  });
});

describe('loan: крайние случаи', () => {
  it('нулевая ставка — равные платежи без переплаты', () => {
    const res = loan({ amount: 1000, rate: 0, months: 3, kind: 'annuity' });
    expect(res.schedule.map((r) => r.payment)).toEqual([333.33, 333.33, 333.34]);
    expect(res.overpay).toBe(0);
  });

  it('один месяц', () => {
    const res = loan({ amount: 1000, rate: 12, months: 1, kind: 'annuity' });
    expect(res.payment).toBe(1010);
  });

  it('некорректный ввод — исключение', () => {
    expect(() => loan({ amount: 0, rate: 12, months: 12, kind: 'annuity' })).toThrow();
    expect(() => loan({ amount: 1000, rate: 12, months: 1.5, kind: 'annuity' })).toThrow();
  });
});

describe('loan: округление ровно на половине копейки', () => {
  it('остаток 272 682,00 под 11% даёт ровно 2 499,585 процентов за месяц → 2 499,59', () => {
    // Эталон — Python decimal: месяц 244 графика 400 000 под 11% на 360 месяцев.
    const r = loan({ amount: 400000, rate: 11, months: 360, kind: 'annuity' });
    expect(r.schedule[242].balance).toBe(272682);
    expect(r.schedule[243].interest).toBe(2499.59);
    expect(r.overpay).toBeCloseTo(971355.5, 2);
  });
});

describe('loan: досрочные погашения', () => {
  it('без погашений график прежний, extra в строках нет', () => {
    const a = loan({ amount: 1_000_000, rate: 12, months: 60, kind: 'annuity' });
    const b = loan({ amount: 1_000_000, rate: 12, months: 60, kind: 'annuity', prepayments: [] });
    expect(b).toEqual(a);
    expect(a.extraTotal).toBe(0);
    expect(a.schedule.some((r) => 'extra' in r)).toBe(false);
  });

  it('погашение сразу после выдачи уменьшает сумму, с которой считается первый месяц', () => {
    const r = loan({ amount: 1000, rate: 12, months: 12, kind: 'annuity', prepayments: [{ after: 0, amount: 1000, mode: 'term', repeat: 'once' }] });
    expect(r).toMatchObject({ schedule: [], total: 1000, overpay: 0, extraTotal: 1000, payment: 0 });
  });

  it('сумма платежей и досрочных погашений = основной долг + проценты', () => {
    const r = loan({ amount: 1_000_000, rate: 12, months: 120, kind: 'differentiated', prepayments: [{ after: 3, amount: 7000, mode: 'payment', repeat: 'monthly' }] });
    const paid = r.schedule.reduce((s, x) => s + x.payment + (x.extra ?? 0), 0);
    const interest = r.schedule.reduce((s, x) => s + x.interest, 0);
    expect(paid).toBeCloseTo(r.total, 2);
    expect(r.total - 1_000_000).toBeCloseTo(interest, 2);
    expect(r.schedule.at(-1)!.balance).toBe(0);
  });
});
