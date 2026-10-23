import { describe, expect, it } from 'vitest';
import { fromGrams, toGrams } from './measures';

describe('кухонные меры', () => {
  it('эталоны King Arthur на американскую чашку', () => {
    expect(toGrams(1, 'cupUs', 'flour')).toBeCloseTo(120, 6);
    expect(toGrams(1, 'cupUs', 'sugar')).toBeCloseTo(198, 6);
    expect(toGrams(0.5, 'cupUs', 'butter')).toBeCloseTo(113.5, 6);
    expect(toGrams(1, 'tbsp', 'honey')).toBeCloseTo(21.303, 3);
  });

  it('стакан 200 и 250 мл', () => {
    expect(toGrams(1, 'glass200', 'water')).toBe(200);
    expect(toGrams(1, 'glass200', 'sugar')).toBeCloseTo(167.38, 2);
  });

  it('плотно: эталоны «Книги о вкусной и здоровой пище» на стакан 250 мл и Baking Sense на чашку', () => {
    expect(toGrams(1, 'cup250', 'flour', 'scooped')).toBeCloseTo(160, 6);
    expect(toGrams(1, 'cup250', 'cornstarch', 'scooped')).toBeCloseTo(160, 6);
    expect(toGrams(1, 'cup250', 'cocoa', 'scooped')).toBeCloseTo(120, 6);
    expect(toGrams(1, 'cupUs', 'wholeWheatFlour', 'scooped')).toBeCloseTo(140, 6);
    expect(toGrams(1, 'glass200', 'flour', 'scooped')).toBeCloseTo(128, 6);
  });

  it('способ наполнения не влияет на ложки и непорошковые продукты', () => {
    expect(toGrams(1, 'tbsp', 'flour', 'spooned')).toBeCloseTo(9.6, 6);
    expect(toGrams(1, 'tbsp', 'flour', 'scooped')).toBeCloseTo(9.6, 6);
    expect(toGrams(1, 'glass200', 'sugar', 'scooped')).toBe(toGrams(1, 'glass200', 'sugar', 'spooned'));
    expect(fromGrams(128, 'glass200', 'flour', 'scooped')).toBeCloseTo(1, 9);
  });

  it('граммы → меры и обратно', () => {
    expect(fromGrams(120, 'cupUs', 'flour')).toBeCloseTo(1, 9);
    expect(fromGrams(250, 'g', 'flour')).toBe(250);
    expect(toGrams(250, 'g', 'flour')).toBe(250);
    expect(fromGrams(100, 'tbsp', 'water')).toBeCloseTo(6.6667, 4);
  });
});
