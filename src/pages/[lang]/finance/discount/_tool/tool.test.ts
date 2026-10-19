import { describe, expect, it } from 'vitest';
import { discount } from './tool';

describe('discount', () => {
  it.each([
    [2490, 15, 2116.5, 373.5],
    [100, 0, 100, 0],
    [100, 100, 0, 100],
    [59.99, 30, 41.993, 17.997],
  ])('%d − %d%%', (price, pct, final, saving) => {
    const r = discount(price, pct);
    expect(r.final).toBeCloseTo(final, 9);
    expect(r.saving).toBeCloseTo(saving, 9);
  });
});
