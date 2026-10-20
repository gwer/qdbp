import { describe, expect, it } from 'vitest';
import { fuelCost, fuelLiters } from './tool';

describe('fuelCost', () => {
  it('500 км при 8 л/100 км по 62 — 40 л, 2480', () => {
    expect(fuelCost(500, 8, 'l100km', 62, 2)).toEqual({ cost: 2480, perPerson: 1240, fuel: 40 });
  });

  it('км/л: 600 км при 12 км/л — 50 л', () => expect(fuelLiters(600, 12, 'kml')).toBe(50));

  it('300 миль при 30 mpg US по $3.50 — 10 галлонов, $35', () => {
    const r = fuelCost(300 * 1.609344, 30, 'mpgus', 3.5, 1);
    expect(r.cost).toBeCloseTo(35, 9);
    expect(r.fuel).toBeCloseTo(37.8541, 4);
  });

  it('mpg UK: 100 миль при 50 mpg — 2 британских галлона', () => {
    expect(fuelLiters(100 * 1.609344, 50, 'mpguk')).toBeCloseTo(9.09218, 5);
  });

  it('нулевой расход — ошибка', () => expect(() => fuelLiters(100, 0, 'l100km')).toThrow(RangeError));
});

describe('туда и обратно', () => {
  it('вдвое больше топлива и денег', () => {
    const one = fuelCost(500, 8, 'l100km', 62, 2);
    const both = fuelCost(500, 8, 'l100km', 62, 2, true);
    expect(both.fuel).toBeCloseTo(80, 9);
    expect(both.cost).toBeCloseTo(one.cost * 2, 9);
  });
});
