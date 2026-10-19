import { describe, expect, it } from 'vitest';
import { addPercent } from './tool';

describe('addPercent', () => {
  it.each([
    [1000, 20, 1, 1200, 200],
    [1000, 20, -1, 800, 200],
    [59.9, 15, 1, 68.885, 8.985],
    [250, 100, -1, 0, 250],
    [80, 12.5, 1, 90, 10],
  ] as const)('%d ± %d%%', (value, percent, sign, result, part) => {
    const r = addPercent(value, percent, sign);
    expect(r.result).toBeCloseTo(result, 10);
    expect(r.part).toBeCloseTo(part, 10);
  });

  it('+20% и затем −20% не возвращают исходное число', () => {
    expect(addPercent(addPercent(100, 20, 1).result, 20, -1).result).toBeCloseTo(96, 10);
  });
});
