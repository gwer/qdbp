import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/units';
import { wallpaper } from './tool';

const room = { length: 5, width: 4, height: 2.7, openings: 2.2, rollWidth: 0.53, rollLength: 10.05 };

describe('wallpaper (метрика)', () => {
  it('без раппорта: 30 полос, по 3 из рулона, 10 рулонов', () => {
    const r = wallpaper({ ...room, repeat: 0 });
    expect(r).toMatchObject({ rolls: 10, strips: 30, perRoll: 3 });
    expect(r.strip).toBeCloseTo(2.8, 10);
  });

  it('раппорт 64 см: полоса 3,2 м, всё ещё 3 полосы из рулона', () => {
    const r = wallpaper({ ...room, repeat: 64 });
    expect(r.strip).toBeCloseTo(3.2, 10);
    expect(r.perRoll).toBe(3);
  });

  it('раппорт 70 см: 2,8 м — ровно 4 раппорта, полоса не удлиняется', () => {
    const r = wallpaper({ ...room, repeat: 70 });
    expect(r.strip).toBeCloseTo(2.8, 10);
    expect(r.perRoll).toBe(3);
  });

  it('раппорт 90 см: полоса 3,6 м, 2 полосы из рулона, 15 рулонов', () => {
    const r = wallpaper({ ...room, repeat: 90 });
    expect(r.strip).toBeCloseTo(3.6, 10);
    expect(r).toMatchObject({ perRoll: 2, rolls: 15 });
  });

  it('метровые обои', () => {
    expect(wallpaper({ ...room, rollWidth: 1.06, repeat: 0 })).toMatchObject({ strips: 15, rolls: 5 });
  });

  it('стена выше рулона — ошибка', () => {
    expect(() => wallpaper({ ...room, height: 12, repeat: 0 })).toThrow();
  });
});

describe('wallpaper (США, double roll 20,5 in × 33 ft)', () => {
  const ft = (v: number) => convert(v, 'ft', 'm');
  const us = { length: ft(16), width: ft(13), height: ft(8), openings: ft(6), rollWidth: convert(20.5, 'in', 'm'), rollLength: ft(33) };

  it('16 × 13 ft, 8 ft: 31 полоса, 3 из рулона, 11 рулонов', () => {
    expect(wallpaper({ ...us, repeat: 0 })).toMatchObject({ strips: 31, perRoll: 3, rolls: 11 });
  });

  it('раппорт 21 in: полоса 8,75 ft, всё ещё 3 из рулона', () => {
    const r = wallpaper({ ...us, repeat: convert(21, 'in', 'cm') });
    expect(convert(r.strip, 'm', 'ft')).toBeCloseTo(8.75, 6);
    expect(r.rolls).toBe(11);
  });
});
