import { describe, expect, it } from 'vitest';
import { breakEven } from './tool';

describe('breakEven', () => {
  it.each([
    [300000, 1500, 900, 500, 750000, 600, 40],
    [10000, 50, 30, 500, 25000, 20, 40],
    [10000, 49, 30, 527, 25823, 19, 38.775510204081634],
  ])('%d / (%d − %d)', (fixed, price, variable, units, revenue, contribution, ratio) => {
    const r = breakEven(fixed, price, variable);
    expect(r.units).toBe(units);
    expect(r.revenue).toBeCloseTo(revenue, 6);
    expect(r.contribution).toBeCloseTo(contribution, 6);
    expect(r.ratio).toBeCloseTo(ratio, 6);
  });

  it('желаемая прибыль добавляется к постоянным затратам', () => {
    // (300 000 + 120 000) / 600 = 700
    expect(breakEven(300000, 1500, 900, 120000)).toMatchObject({ units: 700, revenue: 1050000 });
  });

  it('цена не выше переменных затрат — ошибка', () => {
    expect(() => breakEven(1000, 30, 30)).toThrow();
  });
});
