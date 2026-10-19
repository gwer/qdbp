import { describe, expect, it } from 'vitest';
import { paint } from './tool';

const room = { length: 5, width: 4, height: 2.7, openings: 3.7, coats: 2, rate: 0.12, can: 2.5 };

describe('paint', () => {
  it('стены: 2 × (5 + 4) × 2,7 − 3,7 = 44,9 м²', () => {
    const r = paint({ ...room, surface: 'walls' });
    expect(r.area).toBeCloseTo(44.9, 10);
    expect(r.liters).toBeCloseTo(10.776, 10);
    expect(r.cans).toBe(5);
  });

  it('стены и потолок', () => {
    const r = paint({ ...room, surface: 'wallsCeiling' });
    expect(r.area).toBeCloseTo(64.9, 10);
    expect(r.cans).toBe(7);
  });

  it('только потолок', () => {
    expect(paint({ ...room, surface: 'ceiling', coats: 1 }).liters).toBeCloseTo(2.4, 10);
  });

  it('ровно на целое число банок — без лишней банки', () => {
    expect(paint({ ...room, surface: 'ceiling', coats: 1, rate: 0.125 }).cans).toBe(1);
  });

  it('проёмы больше стен — площадь не уходит в минус', () => {
    expect(paint({ ...room, openings: 1000, surface: 'walls' }).area).toBe(0);
  });
});
