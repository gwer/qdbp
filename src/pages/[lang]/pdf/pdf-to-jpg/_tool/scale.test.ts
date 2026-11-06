import { expect, test } from 'vitest';
import { fitScale, MAX_PIXELS } from './scale';

test('A4 при 300 dpi проходит без уменьшения', () => {
  expect(fitScale(595.28, 841.89, 300 / 72)).toEqual({ scale: 300 / 72, reduced: false });
});

test('A1 при 300 dpi уменьшается, площадь после округления в пределе', () => {
  const r = fitScale(1683.78, 2383.94, 300 / 72);
  expect(r.reduced).toBe(true);
  expect(Math.round(1683.78 * r.scale) * Math.round(2383.94 * r.scale)).toBeLessThanOrEqual(MAX_PIXELS);
  expect(r.scale * 72).toBeGreaterThan(120);
});
