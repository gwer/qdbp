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
    expect(tip(50, 0, 1)).toMatchObject({ tip: 0, total: 50, perPerson: 50, tipPerPerson: 0 });
  });

  it('ноль человек — ошибка', () => {
    expect(() => tip(50, 10, 0)).toThrow();
  });

});

describe('округление с каждого', () => {
  it('4 500 + 10% на троих = 1 650; до 100 — 1 700 с каждого, чаевые 600 (13,3%)', () => {
    const r = tip(4500, 10, 3, '100');
    expect(r.perPerson).toBe(1700);
    expect(r.tip).toBeCloseTo(600, 9);
    expect(r.actual).toBeCloseTo(13.333, 3);
  });

  it('уже круглое не меняется', () => {
    expect(tip(4500, 10, 3, '10').perPerson).toBeCloseTo(1650, 9);
  });
});
