import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/units';
import { paint } from './tool';

const room = { length: 5, width: 4, height: 2.7, openings: 3.7, coats: 2, coverage: 8.3, can: 2.5 };

describe('paint (метрика)', () => {
  it('стены: 2 × (5 + 4) × 2,7 − 3,7 = 44,9 м², 10,82 л, 5 банок по 2,5 л', () => {
    const r = paint({ ...room, surface: 'walls' });
    expect(r.area).toBeCloseTo(44.9, 10);
    expect(r.liters).toBeCloseTo(10.819277108433734, 10);
    expect(r.cans).toBe(5);
  });

  it('стены и потолок', () => {
    const r = paint({ ...room, surface: 'wallsCeiling' });
    expect(r.area).toBeCloseTo(64.9, 10);
    expect(r.cans).toBe(7);
  });

  it('объём тары по рынкам: 10 л (de) — 2, 4 л (es) — 3, 3,6 л (pt) — 4', () => {
    expect(paint({ ...room, surface: 'walls', can: 10 }).cans).toBe(2);
    expect(paint({ ...room, surface: 'walls', can: 4 }).cans).toBe(3);
    expect(paint({ ...room, surface: 'walls', can: 3.6 }).cans).toBe(4);
  });

  it('ровно на целое число банок — без лишней банки', () => {
    expect(paint({ ...room, surface: 'ceiling', coats: 1, coverage: 8, can: 2.5 }).cans).toBe(1);
  });

  it('проёмы больше стен — площадь не уходит в минус', () => {
    expect(paint({ ...room, openings: 1000, surface: 'walls' }).area).toBe(0);
  });
});

describe('paint (США)', () => {
  const ft = (v: number) => convert(v, 'ft', 'm');
  const us = {
    length: ft(16),
    width: ft(13),
    height: ft(8),
    openings: convert(36, 'ft2', 'm2'),
    coats: 2,
    coverage: convert(350, 'ft2_per_gal', 'm2_per_l'),
    can: convert(1, 'gal', 'l'),
  };

  it('16 × 13 ft, 8 ft, 36 sq ft проёмов, 350 sq ft/gal: 428 sq ft, 2,45 gal, 3 галлона', () => {
    const r = paint({ ...us, surface: 'walls' });
    expect(convert(r.area, 'm2', 'ft2')).toBeCloseTo(428, 6);
    expect(convert(r.liters, 'l', 'gal')).toBeCloseTo(2.4457142857, 6);
    expect(r.cans).toBe(3);
  });

  it('со стенами и потолком — 636 sq ft, 4 галлона', () => {
    const r = paint({ ...us, surface: 'wallsCeiling' });
    expect(convert(r.area, 'm2', 'ft2')).toBeCloseTo(636, 6);
    expect(r.cans).toBe(4);
  });
});
