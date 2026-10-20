import { describe, expect, it } from 'vitest';
import { age } from './tool';

describe('age', () => {
  it('обычный случай', () => {
    expect(age('1990-06-15', '2026-10-19')).toEqual({ years: 36, months: 4, days: 4, totalDays: 13275, nextBirthday: 239 });
  });

  it('в день рождения — 0 дней до следующего', () => {
    expect(age('1990-06-15', '2026-06-15')).toMatchObject({ years: 36, months: 0, days: 0, nextBirthday: 0 });
  });

  it('накануне дня рождения', () => {
    expect(age('1990-06-15', '2026-06-14')).toMatchObject({ years: 35, months: 11, days: 30, nextBirthday: 1 });
  });

  it('родился 29 февраля', () => {
    expect(age('2000-02-29', '2025-03-01')).toMatchObject({ years: 25, months: 0, days: 1 });
    // День рождения в невисокосный год — 28 февраля: в этот день полных лет уже 25, до дня рождения 0
    expect(age('2000-02-29', '2025-02-28')).toMatchObject({ years: 25, months: 0, days: 0, nextBirthday: 0 });
    expect(age('2000-02-29', '2025-02-27')).toMatchObject({ years: 24, months: 11, days: 29, nextBirthday: 1 });
    expect(age('2000-02-29', '2026-02-27')).toMatchObject({ nextBirthday: 1 });
  });

  it('дата рождения позже — ошибка', () => {
    expect(() => age('2027-01-01', '2026-01-01')).toThrow();
  });
});
