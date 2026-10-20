import { describe, expect, it } from 'vitest';
import { between } from './tool';

describe('between', () => {
  it('без конечного дня', () => {
    expect(between('2026-01-01', '2026-12-31', false)).toMatchObject({ days: 364 });
    expect(between('2026-10-19', '2026-10-26', false)).toMatchObject({ days: 7, weeks: 1, weekdays: 5 });
  });

  it('с конечным днём', () => {
    expect(between('2026-01-01', '2026-12-31', true)).toMatchObject({ days: 365 });
    expect(between('2026-10-19', '2026-10-23', true)).toMatchObject({ days: 5, weekdays: 5 });
  });

  it('обратный порядок — отрицательное число дней', () => {
    expect(between('2026-10-26', '2026-10-19', false)).toMatchObject({ days: -7, weeks: -1, weekdays: 5 });
  });

  it('одна и та же дата', () => {
    expect(between('2026-10-19', '2026-10-19', false)).toMatchObject({ days: 0, weekdays: 0 });
    expect(between('2026-10-19', '2026-10-19', true)).toMatchObject({ days: 1, weekdays: 1 });
  });
});

describe('разбивка на годы, месяцы и дни', () => {
  it('19.10.2026 → 25.12.2027: 1 год 2 месяца 6 дней', () => {
    expect(between('2026-10-19', '2027-12-25', false).ymd).toEqual({ years: 1, months: 2, days: 6 });
  });
});
