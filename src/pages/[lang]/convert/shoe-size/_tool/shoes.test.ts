import { describe, expect, it } from 'vitest';
import { findShoe, SHOES } from './shoes';

describe('размеры обуви', () => {
  it('шкалы согласованы: UK = US муж. − 1, US жен. = US муж. + 1, шаг 5 мм', () => {
    SHOES.forEach((r, i) => {
      expect(r.uk).toBe(r.usM - 1);
      expect(r.usW).toBe(r.usM + 1);
      if (i) expect(r.mm - SHOES[i - 1].mm).toBe(5);
    });
  });

  it('EU 42,5 = US муж. 10 = UK 9 = стопа 27 см', () => {
    expect(findShoe(42.5, 'eu')).toMatchObject({ mm: 270, uk: 9, usM: 10, usW: 11 });
    expect(findShoe(10, 'usM').eu).toBe(42.5);
    expect(findShoe(7.5, 'usW')).toMatchObject({ eu: 38, mm: 240 });
  });

  it('длина стопы округляется вверх до 5 мм', () => {
    expect(findShoe(26.5, 'cm').mm).toBe(265);
    expect(findShoe(26.3, 'cm').mm).toBe(265);
    expect(findShoe(26.6, 'cm').mm).toBe(270);
  });

  it('промежуточный EU — ближайший размер', () => {
    expect(findShoe(42, 'eu').eu).toBe(41.5);
    expect(findShoe(39, 'eu').eu).toBe(38.5);
  });

  it('вне таблицы — ошибка', () => {
    expect(() => findShoe(20, 'eu')).toThrow(RangeError);
    expect(() => findShoe(20, 'cm')).toThrow(RangeError);
    expect(() => findShoe(33, 'cm')).toThrow(RangeError);
  });
});
