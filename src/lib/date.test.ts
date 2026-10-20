import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  dayNumber,
  daysBetween,
  diffYMD,
  isoWeek,
  resolveDateDefault,
  usWeek,
  weekday,
  weekdaysBetween,
} from './date';

describe('dayNumber', () => {
  it('реальные и несуществующие даты', () => {
    expect(dayNumber('1970-01-01')).toBe(0);
    expect(dayNumber('2024-02-29')).not.toBeNull();
    expect(dayNumber('2023-02-29')).toBeNull();
    expect(dayNumber('2026-13-01')).toBeNull();
    expect(dayNumber('2026-1-1')).toBeNull();
    expect(dayNumber('')).toBeNull();
  });
});

describe('арифметика', () => {
  it('addDays через границы месяца и года', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
  });

  it('addMonths прижимает к концу месяца', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
    expect(addMonths('2024-02-29', 12)).toBe('2025-02-28');
  });

  it('daysBetween', () => {
    expect(daysBetween('2026-01-01', '2026-12-31')).toBe(364);
    expect(daysBetween('2024-01-01', '2025-01-01')).toBe(366);
    expect(daysBetween('2026-05-10', '2026-05-01')).toBe(-9);
  });
});

describe('diffYMD (возраст)', () => {
  it.each([
    ['1990-06-15', '2026-10-19', { years: 36, months: 4, days: 4 }],
    ['1990-06-15', '2026-06-15', { years: 36, months: 0, days: 0 }],
    ['1990-06-15', '2026-06-14', { years: 35, months: 11, days: 30 }],
    ['2000-01-31', '2000-02-29', { years: 0, months: 1, days: 0 }],
    ['2000-01-31', '2000-02-28', { years: 0, months: 0, days: 28 }],
    ['2000-01-31', '2000-03-01', { years: 0, months: 1, days: 1 }],
    ['2024-02-29', '2025-02-28', { years: 1, months: 0, days: 0 }],
    ['2024-02-29', '2025-02-27', { years: 0, months: 11, days: 29 }],
    ['2024-02-29', '2025-03-01', { years: 1, months: 0, days: 1 }],
  ])('%s → %s', (from, to, expected) => {
    expect(diffYMD(from, to)).toEqual(expected);
  });
});

describe('дни недели', () => {
  it('weekday: 0 — понедельник', () => {
    expect(weekday('1970-01-01')).toBe(3);
    expect(weekday('2026-10-19')).toBe(0);
    expect(weekday('2026-10-25')).toBe(6);
  });

  it('weekday до 1970 совпадает с Date.getUTCDay', () => {
    for (let d = '1969-12-20'; d < '1970-01-10'; d = addDays(d, 1)) {
      expect(weekday(d), d).toBe((new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7);
    }
    expect(weekday('1900-01-01')).toBe(0);
  });

  it('weekdaysBetween до 1970: суббота и воскресенье — 0 будних', () => {
    expect(weekdaysBetween('1969-12-27', '1969-12-29')).toBe(0);
    expect(weekdaysBetween('1969-12-22', '1970-01-05')).toBe(10);
  });

  it('weekdaysBetween совпадает с перебором', () => {
    const brute = (a: string, b: string) => {
      let n = 0;
      for (let d = a; d < b; d = addDays(d, 1)) if (weekday(d) < 5) n++;
      return n;
    };
    for (const [a, b] of [['2026-10-19', '2026-10-26'], ['2026-10-18', '2026-11-30'], ['2026-01-01', '2027-01-01'], ['2026-10-25', '2026-10-26']]) {
      expect(weekdaysBetween(a, b)).toBe(brute(a, b));
    }
    expect(weekdaysBetween('2026-10-20', '2026-10-19')).toBe(0);
  });
});

describe('недели', () => {
  it.each([
    ['2026-10-19', 43, 2026],
    ['2026-01-01', 1, 2026],
    ['2027-01-01', 53, 2026],
    ['2024-12-30', 1, 2025],
    ['2021-01-03', 53, 2020],
    ['1969-12-28', 52, 1969],
    ['1969-12-29', 1, 1970],
  ])('ISO %s → неделя %d (%d)', (iso, week, year) => {
    expect(isoWeek(iso)).toMatchObject({ week, year });
  });

  it('ISO: границы недели — понедельник и воскресенье', () => {
    expect(isoWeek('2026-10-22')).toMatchObject({ start: '2026-10-19', end: '2026-10-25' });
  });

  it.each([
    ['2026-01-01', 1],
    ['2026-01-04', 2],
    ['2026-10-19', 43],
    ['2026-12-31', 53],
    ['1969-12-27', 52],
    ['1969-12-28', 53],
  ])('US %s → неделя %d', (iso, week) => {
    expect(usWeek(iso).week).toBe(week);
  });
});

describe('resolveDateDefault', () => {
  it('фиксированная дата и «сегодня»', () => {
    expect(resolveDateDefault('1990-06-15', null)).toBe('1990-06-15');
    expect(resolveDateDefault('today', null)).toBeNull();
    expect(resolveDateDefault('today', '2026-10-19')).toBe('2026-10-19');
    expect(resolveDateDefault('today+30', '2026-10-19')).toBe('2026-11-18');
    expect(resolveDateDefault('today-1', '2026-01-01')).toBe('2025-12-31');
    expect(resolveDateDefault('next-01-01', null)).toBeNull();
    expect(resolveDateDefault('next-01-01', '2026-10-19')).toBe('2027-01-01');
    expect(resolveDateDefault('next-01-01', '2027-01-01')).toBe('2028-01-01');
    expect(resolveDateDefault('next-12-25', '2026-10-19')).toBe('2026-12-25');
  });
});
