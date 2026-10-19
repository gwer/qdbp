import { describe, expect, it } from 'vitest';
import { markup } from './tool';

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
