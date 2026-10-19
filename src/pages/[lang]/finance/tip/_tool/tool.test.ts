import { describe, expect, it } from 'vitest';
import { tip } from './tool';

describe('tip', () => {
  it('счёт 86,40, 18%, трое', () => {
    const r = tip(86.4, 18, 3);
    expect(r.tip).toBeCloseTo(15.552, 9);
    expect(r.total).toBeCloseTo(101.952, 9);
    expect(r.perPerson).toBeCloseTo(33.984, 9);
  });

  it('один человек, без чаевых', () => {
    expect(tip(50, 0, 1)).toEqual({ tip: 0, total: 50, perPerson: 50, tipPerPerson: 0 });
  });

  it('ноль человек — ошибка', () => {
    expect(() => tip(50, 10, 0)).toThrow();
  });

});
