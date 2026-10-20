import { describe, expect, it } from 'vitest';
import { margin, priceForMargin } from './tool';

describe('margin', () => {
  it('себестоимость 800, цена 1000', () => {
    expect(margin(800, 1000)).toEqual({ margin: 20, profit: 200, markup: 25 });
  });

  it('продажа в убыток — отрицательная маржа', () => {
    expect(margin(120, 100)).toMatchObject({ margin: -20, profit: -20 });
  });

  it('нулевая цена — ошибка', () => {
    expect(() => margin(10, 0)).toThrow();
  });

  it('нулевая себестоимость — наценка не определена', () => {
    expect(margin(0, 100).markup).toBeNaN();
  });
});

describe('priceForMargin', () => {
  it('себестоимость 700, маржа 30% — цена 1000', () => {
    const r = priceForMargin(700, 30);
    expect(r.price).toBeCloseTo(1000, 9);
    expect(r.markup).toBeCloseTo(42.857142857, 6);
    expect(margin(700, r.price).margin).toBeCloseTo(30, 9);
  });

  it('маржа 100% и больше невозможна', () => {
    expect(() => priceForMargin(100, 100)).toThrow('marginTooHigh');
  });
});
