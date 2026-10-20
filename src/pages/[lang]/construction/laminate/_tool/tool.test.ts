import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/units';
import { laminate } from './tool';

describe('laminate', () => {
  it('20 м² + 7 % = 21,4 м² → 11 упаковок по 2,13 м²', () => {
    const r = laminate({ length: 5, width: 4, reserve: 7, pack: 2.13 });
    expect(r.area).toBe(20);
    expect(r.needed).toBeCloseTo(21.4, 10);
    expect(r.packs).toBe(11);
    expect(r.bought).toBeCloseTo(23.43, 10);
  });

  it('ровно целое число упаковок — без лишней', () => {
    expect(laminate({ length: 2, width: 2, reserve: 0, pack: 2 }).packs).toBe(2);
  });

  it('США: 16 × 13 ft = 208 sq ft + 7 % = 222,56 sq ft → 12 коробок по 20 sq ft', () => {
    const r = laminate({ length: convert(16, 'ft', 'm'), width: convert(13, 'ft', 'm'), reserve: 7, pack: convert(20, 'ft2', 'm2') });
    expect(convert(r.area, 'm2', 'ft2')).toBeCloseTo(208, 6);
    expect(convert(r.needed, 'm2', 'ft2')).toBeCloseTo(222.56, 6);
    expect(r.packs).toBe(12);
  });
});

describe('плинтус', () => {
  it('комната 5 × 4, дверь 0,8 м: 17,2 м — 7 планок по 2,5 м', () => {
    const r = laminate({ length: 5, width: 4, reserve: 7, pack: 2.13, doors: 0.8, plinth: 2.5 });
    expect(r.plinthLength).toBeCloseTo(17.2, 9);
    expect(r.plinths).toBe(7);
  });
});
