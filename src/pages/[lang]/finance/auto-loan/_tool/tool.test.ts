import { describe, expect, it } from 'vitest';
import { autoLoan } from './tool';

// Эталоны — Python decimal (тот же график, округление до центов).
describe('autoLoan', () => {
  it.each([
    [{ price: 2500000, down: 500000, tradeIn: 0, tax: 0, fees: 0, rate: 18, months: 60 }, 2000000, 50786.85, 1047211.47, 3547211.47],
    [{ price: 35000, down: 5000, tradeIn: 0, tax: 7, fees: 500, rate: 7, months: 60 }, 32950, 652.45, 6197, 44147],
    [{ price: 35000, down: 5000, tradeIn: 8000, tax: 7, fees: 500, rate: 7, months: 60 }, 24390, 482.95, 4587.14, 33977.14],
    [{ price: 100000, down: 20000, tradeIn: 0, tax: 0, fees: 0, rate: 24, months: 48 }, 80000, 2608.15, 45190.91, 145190.91],
  ])('%o', (input, financed, payment, overpay, totalCost) => {
    const r = autoLoan(input);
    expect(r.financed).toBeCloseTo(financed, 6);
    expect(r.payment).toBeCloseTo(payment, 2);
    expect(r.overpay).toBeCloseTo(overpay, 2);
    expect(r.totalCost).toBeCloseTo(totalCost, 2);
  });

  it('взнос покрывает всё — кредит не нужен', () => {
    expect(() => autoLoan({ price: 10000, down: 10000, tradeIn: 0, tax: 0, fees: 0, rate: 5, months: 12 })).toThrow();
  });
});

describe('долг за сдаваемую машину', () => {
  it('добавляется к сумме кредита', async () => {
    const { autoLoan } = await import('./tool');
    const base = { price: 35000, down: 5000, tradeIn: 10000, tax: 0, fees: 0, rate: 7, months: 60 };
    expect(autoLoan({ ...base, owed: 12000 }).financed - autoLoan(base).financed).toBeCloseTo(12000, 9);
  });
});
