import { describe, expect, it } from 'vitest';
import { bricks } from './tool';

const wall = { length: 6, height: 2.7, openings: 2, joint: 10, reserve: 5 };

describe('bricks', () => {
  it.each([
    ['250x120x65', 51.3],
    ['250x120x88', 39.2],
    ['240x115x71', 49.4],
    ['240x115x52', 64.5],
  ] as const)('%s, полкирпича, шов 10 мм — %d шт/м² (как в справочных таблицах)', (format, perM2) => {
    expect(bricks({ ...wall, format, thickness: 'half' }).perM2).toBeCloseTo(perM2, 1);
  });

  it('стена 6 × 2,7 − 2 м², в 1 кирпич, +5 %', () => {
    const r = bricks({ ...wall, format: '250x120x65', thickness: 'one' });
    expect(r.area).toBeCloseTo(14.2, 10);
    expect(r.bricks).toBe(1530);
  });

  it('толщина кратна полукирпичам', () => {
    const half = bricks({ ...wall, format: '240x115x71', thickness: 'half', reserve: 0 }).perM2;
    expect(bricks({ ...wall, format: '240x115x71', thickness: 'two', reserve: 0 }).perM2).toBeCloseTo(half * 4, 10);
  });
});
