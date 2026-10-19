import { describe, expect, it } from 'vitest';
import { mortgage } from './mortgage';

// Эталоны платежей — формула аннуитета P·r / (1 − (1 + r)^−n), посчитана в Python.
describe('mortgage', () => {
  it('аннуитет: 400 000, взнос 20%, 6,5%, 30 лет', () => {
    const r = mortgage({ price: 400000, down: 20, rate: 6.5, years: 30, kind: 'annuity' });
    expect(r).toMatchObject({ principal: 320000, downPayment: 80000, payment: 2022.62 });
    expect(r.byYear).toHaveLength(30);
    expect(r.byYear.at(-1)!.balance).toBe(0);
  });

  it.each([
    [8000000, 16, 20, 89040.38],
    [250000, 3, 25, 948.42],
    [400000, 3.5, 25, 1602],
  ])('аннуитет: %d, %d%%, %d лет', (price, rate, years, payment) => {
    expect(mortgage({ price, down: 20, rate, years, kind: 'annuity' }).payment).toBe(payment);
  });

  it('SAC / дифференцированный: первый платёж и переплата A·r·(n + 1)/2', () => {
    const r = mortgage({ price: 500000, down: 20, rate: 11, years: 30, kind: 'differentiated' });
    expect(r.payment).toBe(4777.78);
    // Небольшое расхождение — из-за округления каждого платежа до сотых.
    expect(Math.abs(r.overpay - (400000 * 0.11 * 361) / 24)).toBeLessThan(5);
  });

  it('сводка по годам сходится с итогами', () => {
    const r = mortgage({ price: 400000, down: 20, rate: 6.5, years: 30, kind: 'annuity' });
    const paid = r.byYear.reduce((s, y) => s + y.paid, 0);
    const principal = r.byYear.reduce((s, y) => s + y.principal, 0);
    expect(paid).toBeCloseTo(r.total, 1);
    expect(principal).toBeCloseTo(320000, 1);
  });

  it('взнос 100% — занимать нечего', () => {
    expect(() => mortgage({ price: 100, down: 100, rate: 5, years: 10, kind: 'annuity' })).toThrow();
  });

});
