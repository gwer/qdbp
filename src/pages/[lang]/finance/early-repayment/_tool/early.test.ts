import { describe, expect, it } from 'vitest';
import { earlyRepayment } from './early';

// Эталоны — независимый пересчёт графика в Python (decimal, округление до копеек на каждом шаге).
describe('earlyRepayment', () => {
  it.each([
    [{ amount: 5000000, rate: 16, months: 240, after: 24, extra: 500000, mode: 'term' }, 4667670.51, 69562.8, 142, 11695066.31],
    [{ amount: 5000000, rate: 16, months: 240, after: 24, extra: 500000, mode: 'payment' }, 1027381.75, 62491.56, 216, 11695066.31],
    [{ amount: 300000, rate: 7, months: 360, after: 60, extra: 20000, mode: 'term' }, 79059.96, 1995.91, 251, 418524.05],
    [{ amount: 300000, rate: 7, months: 360, after: 60, extra: 20000, mode: 'payment' }, 22404.46, 1854.55, 300, 418524.05],
    [{ amount: 200000, rate: 3.5, months: 300, after: 36, extra: 10000, mode: 'term' }, 10953.03, 1001.25, 244, 100373.59],
    [{ amount: 200000, rate: 3.5, months: 300, after: 36, extra: 10000, mode: 'payment' }, 4352.78, 946.88, 264, 100373.59],
    [{ amount: 150000, rate: 3, months: 300, after: 36, extra: 10000, mode: 'term' }, 8726.73, 711.32, 238, 63394.69],
    [{ amount: 400000, rate: 11, months: 360, after: 24, extra: 40000, mode: 'term' }, 427606.46, 3809.29, 214, 971355.5],
    [{ amount: 400000, rate: 11, months: 360, after: 24, extra: 40000, mode: 'payment' }, 89227.34, 3424.7, 336, 971355.5],
    [{ amount: 1000, rate: 12, months: 12, after: 0, extra: 100, mode: 'term' }, 12.44, 88.85, 11, 66.19],
  ] as const)('%o', (input, savings, newPayment, newMonths, interestBefore) => {
    const r = earlyRepayment(input);
    expect(r.savings).toBeCloseTo(savings, 2);
    expect(r.newPayment).toBeCloseTo(newPayment, 2);
    expect(r.newMonths).toBe(newMonths);
    expect(r.interestBefore).toBeCloseTo(interestBefore, 2);
    expect(r.schedule.at(-1)!.balance).toBe(0);
  });

  it('досрочный платёж больше остатка — кредит закрыт', () => {
    const r = earlyRepayment({ amount: 1000, rate: 12, months: 12, after: 6, extra: 2000, mode: 'term' });
    expect(r).toMatchObject({ newMonths: 0, newPayment: 0, balance: 514.92 });
    expect(r.savings).toBeCloseTo(18.17, 2);
  });

  it('сокращение срока экономит больше, чем уменьшение платежа', () => {
    const base = { amount: 5000000, rate: 16, months: 240, after: 24, extra: 500000 };
    expect(earlyRepayment({ ...base, mode: 'term' }).savings).toBeGreaterThan(earlyRepayment({ ...base, mode: 'payment' }).savings);
  });

  it('некорректный ввод — ошибка', () => {
    expect(() => earlyRepayment({ amount: 1000, rate: 12, months: 12, after: 12, extra: 100, mode: 'term' })).toThrow();
    expect(() => earlyRepayment({ amount: 1000, rate: 12, months: 12, after: 1, extra: 0, mode: 'term' })).toThrow();
  });
});
