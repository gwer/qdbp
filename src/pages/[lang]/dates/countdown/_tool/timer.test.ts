import { describe, expect, it } from 'vitest';
import { localMoment, splitDuration } from './timer';

describe('countdown', () => {
  it('разбивка', () => {
    const ms = ((72 * 24 + 15) * 3600 + 3 * 60 + 12) * 1000 + 999;
    expect(splitDuration(ms)).toEqual({ past: false, days: 72, hours: 15, minutes: 3, seconds: 12, totalHours: 1743, totalMinutes: 104583 });
  });

  it('прошедшее событие', () => {
    expect(splitDuration(-90_000)).toMatchObject({ past: true, days: 0, minutes: 1, seconds: 30 });
  });

  it('момент по местному времени (TZ=UTC в тестах)', () => {
    expect(localMoment('2027-01-01', 0)).toBe(Date.UTC(2027, 0, 1));
    expect(localMoment('2026-12-31', 23 * 60 + 59)).toBe(Date.UTC(2026, 11, 31, 23, 59));
  });
});
