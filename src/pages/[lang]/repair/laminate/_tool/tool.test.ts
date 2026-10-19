import { describe, expect, it } from 'vitest';
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
});
