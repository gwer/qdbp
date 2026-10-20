import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/units';
import { tiles } from './tool';

const base = { area: 10, length: 60, width: 30, thickness: 9, joint: 2, reserve: 10, perBox: 8, adhesive: 4 };

describe('tiles (метрика)', () => {
  it('60×30 см, шов 2 мм, 10 м², запас 10 %', () => {
    const r = tiles(base);
    expect(r.pieces).toBe(61);
    expect(r.boxes).toBe(8);
    expect(r.grout).toBeCloseTo(1.44, 10);
    expect(r.glue).toBe(40);
  });

  it('расход затирки 30×30×8, шов 3 мм — 0,256 кг/м² (как в формуле производителей)', () => {
    expect(tiles({ ...base, area: 1, length: 30, width: 30, thickness: 8, joint: 3 }).grout).toBeCloseTo(0.256, 10);
  });

  it('без запаса и шва — ровно площадь / площадь плитки', () => {
    expect(tiles({ ...base, area: 1.8, joint: 0, reserve: 0 }).pieces).toBe(10);
  });
});

describe('tiles (США)', () => {
  it('100 sq ft, 24 × 12 in, 3/8 in, шов 1/8 in, 10 %, 1 lb/sq ft: 55 плиток, 7 коробок, 4,88 lb затирки, 100 lb клея', () => {
    const r = tiles({
      area: convert(100, 'ft2', 'm2'),
      length: convert(24, 'in', 'cm'),
      width: convert(12, 'in', 'cm'),
      thickness: convert(0.375, 'in', 'mm'),
      joint: convert(0.125, 'in', 'mm'),
      reserve: 10,
      perBox: 8,
      adhesive: convert(1, 'lb_per_ft2', 'kg_per_m2'),
    });
    expect(r.pieces).toBe(55);
    expect(r.boxes).toBe(7);
    expect(convert(r.grout, 'kg', 'lb')).toBeCloseTo(4.8771844200112975, 6);
    expect(convert(r.glue, 'kg', 'lb')).toBeCloseTo(100, 6);
  });
});

describe('площадь по размерам', () => {
  it('пол 2,5 × 1,7 = 4,25 м²; стены (2,5 + 1,7) × 2 × 2,5 − 1,4 = 19,6 м²', async () => {
    const { surfaceArea } = await import('./tool');
    const room = { area: 0, roomLength: 2.5, roomWidth: 1.7, wallHeight: 2.5, openings: 1.4 };
    expect(surfaceArea({ ...room, surface: 'floor' })).toBeCloseTo(4.25, 9);
    expect(surfaceArea({ ...room, surface: 'walls' })).toBeCloseTo(19.6, 9);
    expect(surfaceArea({ ...room, surface: 'area', area: 10 })).toBe(10);
  });
});
