import { describe, expect, it } from 'vitest';
import { def, percentOf } from './tool';

describe('percentOf', () => {
  it.each([
    [20, 150, 30],
    [7, 33, 2.31],
    [100, 42, 42],
    [0, 999, 0],
    [12.5, 80, 10],
    [150, 40, 60],
    [-10, 50, -5],
  ])('%d%% от %d = %d', (p, v, expected) => {
    expect(percentOf(p, v)).toBeCloseTo(expected, 10);
  });

  it('compute возвращает result', () => {
    expect(def.compute({ percent: 20, value: 150 })).toEqual({ result: 30 });
  });
});
