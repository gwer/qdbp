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

describe('обратные задачи', () => {
  it('цена до скидки: 2116,50 при скидке 15% — 2490', async () => {
    const { originalPrice } = await import('./tool');
    expect(originalPrice(2116.5, 15).original).toBeCloseTo(2490, 9);
    expect(originalPrice(720, 10).original).toBeCloseTo(800, 9);
    expect(() => originalPrice(0, 100)).toThrow('fullDiscount');
  });

  it('скидка в процентах по двум ценам', async () => {
    const { discountPercent } = await import('./tool');
    expect(discountPercent(1000, 720).percent).toBeCloseTo(28, 9);
    expect(discountPercent(2490, 2116.5).percent).toBeCloseTo(15, 9);
    expect(() => discountPercent(100, 120)).toThrow('saleAbovePrice');
  });
});
