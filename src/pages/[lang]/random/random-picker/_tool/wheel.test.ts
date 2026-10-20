import { describe, expect, it } from 'vitest';
import { spinTo } from './Wheel';

describe('spinTo', () => {
  it('центр сектора победителя приходит под указатель, колесо крутится только вперёд', () => {
    for (const [angle, winner, n] of [[0, 0, 4], [0, 3, 4], [1234, 2, 7], [90, 5, 6]] as const) {
      const next = spinTo(angle, winner, n);
      expect(next - angle).toBeGreaterThanOrEqual(5 * 360);
      const center = (winner + 0.5) * (360 / n);
      expect((((next + center) % 360) + 360) % 360).toBeCloseTo(0, 9);
    }
  });
});
