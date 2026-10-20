import { describe, expect, it } from 'vitest';
import { panFactor } from './pan';

const round = (a: number) => ({ shape: 'round' as const, a, b: 0 });

describe('panFactor', () => {
  it('круглая 24 → 26 см', () => expect(panFactor(round(24), round(26))).toBeCloseTo(1.1736, 4));
  it('круглая 20 → 24 см', () => expect(panFactor(round(20), round(24))).toBeCloseTo(1.44, 6));
  it('круглая 24 → квадратная 22 см', () => expect(panFactor(round(24), { shape: 'square', a: 22, b: 0 })).toBeCloseTo(1.0699, 4));
  it('круглая 9 in → квадратная 8 in', () => expect(panFactor(round(9), { shape: 'square', a: 8, b: 0 })).toBeCloseTo(1.006, 3));
  it('прямоугольная 30×20 → круглая 26', () =>
    expect(panFactor({ shape: 'rect', a: 30, b: 20 }, round(26))).toBeCloseTo(0.8849, 4));
  it('прямоугольная без ширины — ошибка', () => expect(() => panFactor({ shape: 'rect', a: 30, b: 0 }, round(26))).toThrow());
});
