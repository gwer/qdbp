import { describe, expect, it } from 'vitest';
import { proportion } from './tool';

describe('proportion', () => {
  it('прямая: 3 кг — 12, 5 кг — 20', () => {
    expect(proportion(3, 12, 5, 'direct').x).toBe(20);
  });

  it('прямая с дробными числами', () => {
    expect(proportion(100, 18, 250, 'direct').x).toBe(45);
    expect(proportion(1.5, 2, 4, 'direct').x).toBeCloseTo(16 / 3, 12);
  });

  it('обратная: 4 рабочих — 12 дней, 6 рабочих — 8 дней', () => {
    expect(proportion(4, 12, 6, 'inverse').x).toBe(8);
  });

  it('деление на ноль', () => {
    expect(() => proportion(0, 12, 5, 'direct')).toThrow();
    expect(() => proportion(4, 12, 0, 'inverse')).toThrow();
  });
});
