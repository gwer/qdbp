import { describe, expect, it } from 'vitest';
import { pace, riegel } from './pace';

describe('pace', () => {
  it('10 км за 50:00 — 5:00 на км, 12 км/ч', () => {
    expect(pace(10, 3000)).toEqual({ pace: 300, speed: 12 });
  });

  it('прогноз Ригеля', () => {
    expect(riegel(3000, 10, 5)).toBeCloseTo(1438.896, 2);
    expect(riegel(3000, 10, 21.0975)).toBeCloseTo(6619.209, 2);
    expect(riegel(3000, 10, 42.195)).toBeCloseTo(13800.598, 2);
  });
});
