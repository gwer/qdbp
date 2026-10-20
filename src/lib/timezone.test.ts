import { describe, expect, it } from 'vitest';
import { cityOf, formatOffset, offsetMinutes, utcToZoned, zonedToUtc } from './timezone';

const iso = (ms: number) => new Date(ms).toISOString();

describe('часовые пояса', () => {
  it('смещения с учётом летнего времени', () => {
    expect(offsetMinutes('Europe/Moscow', Date.UTC(2026, 0, 15))).toBe(180);
    expect(offsetMinutes('Europe/Berlin', Date.UTC(2026, 0, 15))).toBe(60);
    expect(offsetMinutes('Europe/Berlin', Date.UTC(2026, 6, 15))).toBe(120);
    expect(offsetMinutes('America/New_York', Date.UTC(2026, 6, 15))).toBe(-240);
    expect(offsetMinutes('Asia/Kolkata', Date.UTC(2026, 6, 15))).toBe(330);
    expect(offsetMinutes('UTC', Date.UTC(2026, 6, 15))).toBe(0);
  });

  it('местное время → UTC', () => {
    expect(iso(zonedToUtc('Europe/Moscow', '2026-10-20', 9 * 60))).toBe('2026-10-20T06:00:00.000Z');
    expect(iso(zonedToUtc('America/New_York', '2026-07-01', 12 * 60))).toBe('2026-07-01T16:00:00.000Z');
    expect(iso(zonedToUtc('America/Sao_Paulo', '2026-01-10', 23 * 60 + 30))).toBe('2026-01-11T02:30:00.000Z');
  });

  it('несуществующее время весной (Берлин, 29.03.2026 02:30) — после перевода', () => {
    const ms = zonedToUtc('Europe/Berlin', '2026-03-29', 150);
    expect(utcToZoned('Europe/Berlin', ms)).toEqual({ date: '2026-03-29', minutes: 210 });
  });

  it('повторяющееся время осенью (Берлин, 25.10.2026 02:30) — первое', () => {
    expect(iso(zonedToUtc('Europe/Berlin', '2026-10-25', 150))).toBe('2026-10-25T00:30:00.000Z');
  });

  it.each([
    // [пояс, дата, местное время, ожидаемый UTC] — весенний пропуск: время после перевода
    ['America/New_York', '2026-03-08', 150, '2026-03-08T07:30:00.000Z'],
    ['Europe/Berlin', '2026-03-29', 150, '2026-03-29T01:30:00.000Z'],
    ['Australia/Lord_Howe', '2026-10-04', 135, '2026-10-03T15:45:00.000Z'],
    // осенний повтор: первое из двух
    ['America/New_York', '2026-11-01', 90, '2026-11-01T05:30:00.000Z'],
    ['Australia/Sydney', '2026-04-05', 150, '2026-04-04T15:30:00.000Z'],
    ['Australia/Lord_Howe', '2026-04-05', 105, '2026-04-04T14:45:00.000Z'],
  ] as const)('перевод часов: %s %s %d мин → %s', (zone, date, minutes, utc) => {
    expect(iso(zonedToUtc(zone, date, minutes))).toBe(utc);
  });

  it('UTC → местное время, смена даты', () => {
    expect(utcToZoned('Asia/Tokyo', Date.UTC(2026, 9, 20, 18, 0))).toEqual({ date: '2026-10-21', minutes: 180 });
  });

  it('подписи', () => {
    expect(formatOffset(330)).toBe('UTC+05:30');
    expect(formatOffset(-240)).toBe('UTC−04:00');
    expect(cityOf('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
  });
});
