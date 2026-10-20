import { describe, expect, it } from 'vitest';
import { electricityCost } from './tool';

describe('electricityCost', () => {
  it('обогреватель 2000 Вт по 3 часа при 6,5 за кВт·ч', () => {
    const r = electricityCost(2000, 3, 6.5);
    expect(r.kwhDay).toBe(6);
    expect(r.costDay).toBeCloseTo(39, 9);
    expect(r.costMonth).toBeCloseTo(1170, 9);
    expect(r.costYear).toBeCloseTo(14235, 9);
  });

  it('больше 24 часов — ошибка', () => expect(() => electricityCost(100, 25, 1)).toThrow(RangeError));
});
