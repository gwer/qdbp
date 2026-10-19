import { describe, expect, it } from 'vitest';
import { deposit } from './deposit';

// Эталоны — замкнутые формулы сложного процента (посчитаны в Python).
describe('deposit', () => {
  it('ежемесячная капитализация: P·(1 + r/12)^(12t)', () => {
    expect(deposit({ initial: 10000, monthly: 0, rate: 5, years: 10, cap: 'monthly' }).total).toBe(16470.09);
  });

  it('ежеквартальная: P·(1 + r/4)^(4t)', () => {
    expect(deposit({ initial: 10000, monthly: 0, rate: 5, years: 10, cap: 'quarterly' }).total).toBe(16436.19);
  });

  it('ежегодная: P·(1 + r)^t', () => {
    expect(deposit({ initial: 10000, monthly: 0, rate: 5, years: 10, cap: 'yearly' }).total).toBe(16288.95);
  });

  it('только пополнения: PMT·((1 + i)^n − 1) / i', () => {
    expect(deposit({ initial: 0, monthly: 200, rate: 5, years: 10, cap: 'monthly' })).toMatchObject({
      total: 31056.46,
      contributed: 24000,
      interest: 7056.46,
    });
  });

  it('примеры из текстов', () => {
    expect(deposit({ initial: 100000, monthly: 10000, rate: 12, years: 3, cap: 'monthly' })).toMatchObject({
      total: 573845.66,
      contributed: 460000,
      interest: 113845.66,
    });
    expect(deposit({ initial: 10000, monthly: 200, rate: 5, years: 10, cap: 'monthly' }).total).toBe(47526.55);
    expect(deposit({ initial: 10000, monthly: 200, rate: 3, years: 10, cap: 'monthly' }).total).toBe(41441.82);
    expect(deposit({ initial: 10000, monthly: 500, rate: 10, years: 10, cap: 'monthly' }).total).toBe(129492.9);
  });

  it('таблица по годам', () => {
    const r = deposit({ initial: 10000, monthly: 0, rate: 5, years: 10, cap: 'yearly' });
    expect(r.byYear).toHaveLength(10);
    expect(r.byYear[0]).toEqual({ year: 1, contributed: 10000, interest: 500, balance: 10500 });
  });

  it('нулевая ставка', () => {
    expect(deposit({ initial: 1000, monthly: 100, rate: 0, years: 1, cap: 'monthly' })).toMatchObject({ total: 2200, interest: 0 });
  });

});
