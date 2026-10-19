import { describe, expect, it } from 'vitest';
import { tiles } from './tool';

const base = { area: 10, length: 60, width: 30, thickness: 9, joint: 2, reserve: 10, perBox: 8, adhesive: 4 };

describe('tiles', () => {
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
