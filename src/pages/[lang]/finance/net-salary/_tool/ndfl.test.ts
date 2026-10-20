import { describe, expect, it } from 'vitest';
import { annualTax, childDeduction, grossFromNet, salaryYear } from './ndfl';

describe('НДФЛ', () => {
  it.each([
    [1_000_000, 130_000],
    [2_400_000, 312_000],
    [5_000_000, 702_000],
    [20_000_000, 3_402_000],
    [50_000_000, 9_402_000],
    [60_000_000, 11_602_000],
  ])('с %d — %d', (income, tax) => expect(annualTax(income)).toBeCloseTo(tax, 6));

  it('100 000 в месяц — 87 000 на руки весь год', () => {
    const r = salaryYear(100_000);
    expect(r.net).toBe(87_000);
    expect(r.yearTax).toBe(156_000);
    expect(r.months.every((m) => m.tax === 13_000)).toBe(true);
  });

  it('300 000 в месяц: с 9-го месяца ставка 15%', () => {
    const r = salaryYear(300_000);
    expect(r.months[7].tax).toBe(39_000);
    // 8 месяцев = 2,4 млн; 9-й целиком по 15%.
    expect(r.months[8].tax).toBe(45_000);
    expect(r.yearTax).toBe(312_000 + 1_200_000 * 0.15);
    expect(r.rate).toBeCloseTo(13.6667, 3);
  });

  it('копейки: налог в полных рублях', () => {
    expect(salaryYear(33_333).months[0].tax).toBe(4333);
  });

  it('обратный расчёт', () => {
    expect(grossFromNet(87_000)).toBe(100_000);
    expect(grossFromNet(150_000)).toBe(172_414);
    expect(salaryYear(172_414).months.every((m) => Math.abs(m.net - 150_000) <= 1)).toBe(true);
    const g = grossFromNet(400_000);
    expect(salaryYear(g).net).toBeGreaterThanOrEqual(400_000);
    expect(salaryYear(g - 1).net).toBeLessThan(400_000);
  });
});

describe('вычет на детей', () => {
  it('размеры с 2025 года: 1 400, 2 800, 6 000 на третьего и следующих', () => {
    expect([0, 1, 2, 3, 4].map(childDeduction)).toEqual([0, 1400, 4200, 10200, 16200]);
  });

  it('двое детей, 50 000 в месяц: вычет 9 месяцев, с 10-го доход больше 450 000', () => {
    const r = salaryYear(50_000, 2);
    expect(r.months[0].tax).toBe(5954); // (50 000 − 4 200) × 13%
    expect(r.months[9].tax).toBe(6500);
    expect(r.yearTax).toBe(73_086); // (600 000 − 9 × 4 200) × 13%
  });

  it('трое детей, 100 000 в месяц: вычет только 4 месяца', () => {
    expect(salaryYear(100_000, 3).yearTax).toBe(150_696); // (1 200 000 − 4 × 10 200) × 13%
  });

  it('обратный расчёт учитывает вычет', () => {
    const g = grossFromNet(87_000, 1);
    expect(g).toBeLessThan(100_000);
    expect(salaryYear(g, 1).yearNet).toBeGreaterThanOrEqual(87_000 * 12);
    expect(salaryYear(g - 1, 1).yearNet).toBeLessThan(87_000 * 12);
  });
});
