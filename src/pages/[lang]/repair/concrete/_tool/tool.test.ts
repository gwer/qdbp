import { describe, expect, it } from 'vitest';
import { concrete } from './tool';

describe('concrete', () => {
  it('1 м³ смеси 1:2:4 — 317 кг цемента, 0,44 м³ песка, 0,88 м³ щебня (справочные значения)', () => {
    const r = concrete({ length: 1, width: 1, thickness: 1, reserve: 0, mix: '1-2-4', bag: 50 });
    expect(r.cement).toBeCloseTo(316.8, 6);
    expect(r.sand).toBeCloseTo(0.44, 10);
    expect(r.gravel).toBeCloseTo(0.88, 10);
    expect(r.bags).toBe(7);
  });

  it('плита 6 × 4 × 0,15 м + 5 %', () => {
    const r = concrete({ length: 6, width: 4, thickness: 0.15, reserve: 5, mix: '1-2-4', bag: 50 });
    expect(r.volume).toBeCloseTo(3.78, 10);
    expect(r.cement).toBeCloseTo(1197.504, 6);
    expect(r.bags).toBe(24);
    expect(r.water).toBeCloseTo(598.752, 6);
  });

  it('мешки по 25 кг', () => {
    expect(concrete({ length: 6, width: 4, thickness: 0.15, reserve: 5, mix: '1-2-4', bag: 25 }).bags).toBe(48);
  });
});
