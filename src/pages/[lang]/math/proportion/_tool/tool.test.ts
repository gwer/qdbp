import { describe, expect, it } from 'vitest';
import { solve } from './proportion';

const x = (values: (number | null)[], kind: 'direct' | 'inverse') => {
  const s = solve(values, kind);
  if (!s.ok) throw new Error(s.reason);
  return s.value;
};

describe('solve', () => {
  it('прямая: 3 кг — 12, 5 кг — 20; неизвестное в любой клетке', () => {
    expect(x([3, 12, 5, null], 'direct')).toBe(20);
    expect(x([null, 12, 5, 20], 'direct')).toBe(3);
    expect(x([3, null, 5, 20], 'direct')).toBe(12);
    expect(x([3, 12, null, 20], 'direct')).toBe(5);
  });

  it('прямая с дробными числами', () => {
    expect(x([100, 18, 250, null], 'direct')).toBe(45);
    expect(x([1.5, 2, 4, null], 'direct')).toBeCloseTo(16 / 3, 12);
    expect(x([24, 4, null, 10], 'direct')).toBe(60);
  });

  it('обратная: 4 рабочих × 12 дней = 6 рабочих × 8 дней; неизвестное в любой клетке', () => {
    expect(x([4, 12, 6, null], 'inverse')).toBe(8);
    expect(x([4, 12, null, 8], 'inverse')).toBe(6);
    expect(x([4, null, 6, 8], 'inverse')).toBe(12);
    expect(x([null, 12, 6, 8], 'inverse')).toBe(4);
  });

  it('нужно ровно одно неизвестное', () => {
    expect(solve([3, 12, 5, 20], 'direct')).toEqual({ ok: false, reason: 'unknown' });
    expect(solve([3, null, 5, null], 'direct')).toEqual({ ok: false, reason: 'unknown' });
  });

  it('деление на ноль', () => {
    expect(solve([0, 12, 5, null], 'direct')).toEqual({ ok: false, reason: 'zero' });
    expect(solve([4, 12, 0, null], 'inverse')).toEqual({ ok: false, reason: 'zero' });
  });
});
