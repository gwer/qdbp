import { describe, expect, it } from 'vitest';
import { earlyRepayment } from './early';

const one = (after: number, extra: number, mode: string) => `${after}:${extra}:${mode}:once`;

// Эталоны — независимый пересчёт графика в Python (decimal, округление до копеек на каждом шаге).
describe('earlyRepayment: одно погашение', () => {
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
  ] as const)('%o', ({ after, extra, mode, ...loan }, savings, newPayment, newMonths, interestBefore) => {
    const r = earlyRepayment({ ...loan, kind: 'annuity', prepay: one(after, extra, mode) });
    expect(r.savings).toBeCloseTo(savings, 2);
    expect(r.schedule[after].payment).toBeCloseTo(newPayment, 2);
    expect(r.newTerm - after).toBe(newMonths);
    expect(r.interestBefore).toBeCloseTo(interestBefore, 2);
    expect(r.schedule.at(-1)!.balance).toBe(0);
  });

  it('досрочный платёж больше остатка — кредит закрыт', () => {
    const r = earlyRepayment({ amount: 1000, rate: 12, months: 12, kind: 'annuity', prepay: one(6, 2000, 'term') });
    expect(r.newTerm).toBe(6);
    expect(r.schedule.at(-1)).toMatchObject({ extra: 514.92, balance: 0 });
    expect(r.savings).toBeCloseTo(18.17, 2);
  });

  it('сокращение срока экономит больше, чем уменьшение платежа', () => {
    const v = { amount: 5000000, rate: 16, months: 240, kind: 'annuity', prepay: one(24, 500000, 'term') } as const;
    expect(earlyRepayment(v, 'term').savings).toBeGreaterThan(earlyRepayment(v, 'payment').savings);
  });
});

// Эталоны — тот же Python-пересчёт с несколькими и регулярными погашениями.
describe('earlyRepayment: несколько и регулярные погашения', () => {
  it.each([
    [5000000, 16, 240, 'annuity', '24:500000:term:once;36:10000:term:monthly', 5570817.98, 131, 69562.8],
    [300000, 7, 360, 'annuity', '12:5000:payment:yearly', 325320.46, 348, 278.78],
    [1000000, 12, 120, 'differentiated', '6:100000:term:once;18:50000:payment:quarterly', 273336.51, 54, 42.16],
    [1000000, 12, 120, 'annuity', '6:100000:term:once;18:50000:payment:once', 518632.11, 101, 13378.12],
  ] as const)('%d под %d%% на %d мес., %s: %s', (amount, rate, months, kind, prepay, interest, term, lastRegular) => {
    const r = earlyRepayment({ amount, rate, months, kind, prepay });
    expect(r.interestAfter).toBeCloseTo(interest, 2);
    expect(r.newTerm).toBe(term);
    expect(r.lastRegular).toBeCloseTo(lastRegular, 2);
    expect(r.schedule.at(-1)!.balance).toBe(0);
  });
});

describe('earlyRepayment: ошибки', () => {
  it('без погашений, слишком поздно, битая запись', () => {
    const v = { amount: 1000, rate: 12, months: 12, kind: 'annuity' } as const;
    expect(() => earlyRepayment({ ...v, prepay: '' })).toThrow('noPrepayments');
    expect(() => earlyRepayment({ ...v, prepay: one(12, 100, 'term') })).toThrow('afterTooLate');
    expect(() => earlyRepayment({ ...v, prepay: '1:abc:term:once' })).toThrow('prepayments');
    expect(() => earlyRepayment({ ...v, prepay: '1:100:sideways:once' })).toThrow('prepayments');
  });
});

describe('старые ссылки', () => {
  it('after/extra/mode → одна запись; новый prepay важнее; некорректное не переносится', async () => {
    const { def } = await import('./tool');
    const q = (s: string) => def.legacy!(new URLSearchParams(s));
    expect(q('after=12&extra=10000&mode=payment')).toEqual({ prepay: '12:10000:payment:once' });
    expect(q('after=12&extra=10000')).toEqual({ prepay: '12:10000:term:once' });
    expect(q('after=1.5&extra=10000')).toEqual({});
    expect(q('after=12&extra=-5')).toEqual({});
    expect(q('after=12&extra=10000&mode=sideways')).toEqual({});
    expect(q('amount=100')).toEqual({});
    // Повреждённые ссылки (отчёт 16, N03): пустой месяц, пробелы, бесконечная сумма.
    expect(q('after=&extra=10000')).toEqual({});
    expect(q('after=%20%20&extra=10000')).toEqual({});
    expect(q('after=12&extra=Infinity')).toEqual({});
    expect(q('after=12&extra=1e309')).toEqual({});
    expect(q('after=0&extra=10000')).toEqual({ prepay: '0:10000:term:once' });
  });
});
