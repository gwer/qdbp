import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/units';
import { bricks } from './tool';

const wall = { length: 6, height: 2.7, openings: 2, joint: 10, reserve: 5 };

describe('bricks (метрика)', () => {
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

describe('bricks (США, модульный кирпич)', () => {
  const us = {
    length: convert(20, 'ft', 'm'),
    height: convert(8, 'ft', 'm'),
    openings: convert(21, 'ft2', 'm2'),
    format: 'us-modular',
    joint: convert(0.375, 'in', 'mm'),
    reserve: 5,
  } as const;

  it('шов 3/8 in — 6,86 шт на sq ft на один wythe (как в таблицах BIA)', () => {
    expect(convert(1, 'ft2', 'm2') * bricks({ ...us, thickness: 'half' }).perM2).toBeCloseTo(6.857142857, 6);
  });

  it('стена 20 × 8 ft − дверь 21 sq ft = 139 sq ft: 1001 кирпич в один wythe, 2002 — в два', () => {
    expect(convert(bricks({ ...us, thickness: 'half' }).area, 'm2', 'ft2')).toBeCloseTo(139, 6);
    expect(bricks({ ...us, thickness: 'half' }).bricks).toBe(1001);
    expect(bricks({ ...us, thickness: 'one' }).bricks).toBe(2002);
  });
});
