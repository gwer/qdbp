import { describe, expect, it } from 'vitest';
import { roi } from './tool';

// Эталоны — Python.
describe('roi', () => {
  it.each([
    [10000, 15000, 3, 5000, 50, 14.471424255333186],
    [10000, 8000, 2, -2000, -20, -10.557280900008415],
    [1000, 2000, 10, 1000, 100, 7.177346253629313],
  ])('%d → %d за %d лет', (inv, ret, years, profit, r, cagr) => {
    const x = roi(inv, ret, years);
    expect(x.profit).toBeCloseTo(profit, 6);
    expect(x.roi).toBeCloseTo(r, 6);
    expect(x.cagr).toBeCloseTo(cagr, 6);
  });

  it('потеряно всё — −100%', () => {
    expect(roi(1000, 0, 1)).toMatchObject({ roi: -100, cagr: -100 });
  });

  it('некорректный ввод', () => {
    expect(() => roi(0, 100, 1)).toThrow();
    expect(() => roi(100, 100, 0)).toThrow();
  });
});
