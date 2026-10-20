import { describe, expect, it } from 'vitest';
import { parseList, stats } from './stats';

describe('parseList', () => {
  it('пробелы, переносы, точка с запятой', () => {
    expect(parseList('1 2\n3;4\t5', 'ru').numbers).toEqual([1, 2, 3, 4, 5]);
  });

  it('ru: запятая — десятичный разделитель', () => {
    expect(parseList('1,5 2,25', 'ru').numbers).toEqual([1.5, 2.25]);
  });

  it('ru: «1, 2, 3» и «1,2,3» — список', () => {
    expect(parseList('1, 2, 3', 'ru').numbers).toEqual([1, 2, 3]);
    expect(parseList('1,2,3', 'ru').numbers).toEqual([1, 2, 3]);
  });

  it('ru: «1,5, 2,5» — два дробных', () => {
    expect(parseList('1,5, 2,5', 'ru').numbers).toEqual([1.5, 2.5]);
  });

  it('en: запятая — тысячи или список', () => {
    expect(parseList('1,234 5.5', 'en').numbers).toEqual([1234, 5.5]);
    expect(parseList('1,2,3', 'en').numbers).toEqual([1, 2, 3]);
    expect(parseList('1, 2, 3.5', 'en').numbers).toEqual([1, 2, 3.5]);
  });

  it('de: «1.500» — тысяча пятьсот, «1,5» — полтора', () => {
    expect(parseList('1.500 1,5', 'de').numbers).toEqual([1500, 1.5]);
  });

  it('нераспознанное собирается отдельно', () => {
    expect(parseList('1 abc 2 3x', 'ru')).toEqual({ numbers: [1, 2], invalid: ['abc', '3x'] });
  });
});

describe('stats', () => {
  it('эталон: 12 15 11 15 18 20 15', () => {
    // Python: statistics.mean → 15.142857142857142, median → 15, multimode → [15]
    const s = stats([12, 15, 11, 15, 18, 20, 15])!;
    expect(s.mean).toBeCloseTo(15.142857142857142, 12);
    expect(s).toMatchObject({ count: 7, sum: 106, median: 15, mode: [15], min: 11, max: 20, range: 9 });
  });

  it('чётное количество — медиана как среднее двух', () => {
    expect(stats([4, 1, 3, 2])!.median).toBe(2.5);
  });

  it('несколько мод и без моды', () => {
    expect(stats([1, 1, 2, 2, 3])!.mode).toEqual([1, 2]);
    expect(stats([1, 2, 3])!.mode).toEqual([]);
  });

  it('сумма дробных без накопления ошибки', () => {
    expect(stats(Array(10).fill(0.1))!.sum).toBe(1);
  });

  it('пустой список', () => {
    expect(stats([])).toBeNull();
  });
});

describe('stats на больших списках', () => {
  it('150 000 разных чисел — без переполнения стека', () => {
    const r = stats(Array.from({ length: 150_000 }, (_, i) => i));
    expect(r).toMatchObject({ count: 150_000, mean: 74_999.5, mode: [] });
  });
});

describe('стандартное отклонение', () => {
  it('2 4 4 4 5 5 7 9: генеральное 2, выборочное √(32/7)', () => {
    const r = stats([2, 4, 4, 4, 5, 5, 7, 9])!;
    expect(r.sdPop).toBeCloseTo(2, 12);
    expect(r.sd).toBeCloseTo(Math.sqrt(32 / 7), 12);
    expect(r.variance).toBeCloseTo(32 / 7, 12);
  });

  it('одно значение — выборочного нет', () => {
    expect(stats([5])).toMatchObject({ sd: null, sdPop: 0, variance: null });
  });
});
