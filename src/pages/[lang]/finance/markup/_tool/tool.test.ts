import { describe, expect, it } from 'vitest';
import { costFromPrice, markup } from './tool';

describe('markup', () => {
  it('25% наценки = 20% маржи', () => {
    expect(markup(800, 25)).toEqual({ price: 1000, profit: 200, margin: 20 });
  });

  it('100% наценки = 50% маржи', () => {
    expect(markup(50, 100)).toEqual({ price: 100, profit: 50, margin: 50 });
  });

  it('нулевая себестоимость', () => {
    expect(markup(0, 30)).toEqual({ price: 0, profit: 0, margin: 0 });
  });
});

describe('costFromPrice', () => {
  it('цена 1000 при наценке 25% — себестоимость 800', () => {
    const r = costFromPrice(1000, 25);
    expect(r.cost).toBeCloseTo(800, 9);
    expect(r.margin).toBeCloseTo(20, 9);
  });
});
