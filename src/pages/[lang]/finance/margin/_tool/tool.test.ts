import { describe, expect, it } from 'vitest';
import { margin } from './tool';

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
