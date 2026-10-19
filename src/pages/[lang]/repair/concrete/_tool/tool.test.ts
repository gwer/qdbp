import { describe, expect, it } from 'vitest';
import { convert } from '@/lib/units';
import { concrete } from './tool';

const slab = { length: 6, width: 4, thickness: 0.15, reserve: 5, mix: '1-2-4', bag: 50, premixBag: 40 } as const;

describe('concrete (метрика)', () => {
  it('1 м³ смеси 1:2:4 — 317 кг цемента, 0,44 м³ песка, 0,88 м³ щебня (справочные значения)', () => {
    const r = concrete({ ...slab, length: 1, width: 1, thickness: 1, reserve: 0 });
    expect(r.cement).toBeCloseTo(316.8, 6);
    expect(r.sand).toBeCloseTo(0.44, 10);
    expect(r.gravel).toBeCloseTo(0.88, 10);
    expect(r.bags).toBe(7);
  });

  it('плита 6 × 4 × 0,15 м + 5 %', () => {
    const r = concrete(slab);
    expect(r.volume).toBeCloseTo(3.78, 10);
    expect(r.cement).toBeCloseTo(1197.504, 6);
    expect(r.bags).toBe(24);
    expect(r.water).toBeCloseTo(598.752, 6);
    expect(r.premixBags).toBe(202);
  });

  it('мешки по 25 кг', () => {
    const r = concrete({ ...slab, bag: 25, premixBag: 25 });
    expect(r.bags).toBe(48);
    expect(r.premixBags).toBe(323);
  });
});

describe('concrete (США)', () => {
  const us = {
    length: convert(20, 'ft', 'm'),
    width: convert(12, 'ft', 'm'),
    thickness: convert(4, 'in', 'm'),
    reserve: 5,
    mix: '1-2-4',
    bag: convert(94, 'lb', 'kg'),
    premixBag: convert(80, 'lb', 'kg'),
  } as const;

  it('плита 20 × 12 ft, 4 in, +5 %: 84 cu ft = 3,11 cu yd, 140 мешков по 80 lb', () => {
    const r = concrete(us);
    expect(convert(r.volume, 'm3', 'ft3')).toBeCloseTo(84, 6);
    expect(convert(r.volume, 'm3', 'yd3')).toBeCloseTo(3.1111111, 6);
    expect(r.premixBags).toBe(140);
  });

  it('мешок 80 lb даёт 0,6 cu ft: 45 мешков на кубический ярд', () => {
    expect(concrete({ ...us, length: convert(27, 'ft', 'm'), width: convert(1, 'ft', 'm'), thickness: convert(1, 'ft', 'm'), reserve: 0 }).premixBags).toBe(45);
  });

  it('мешки по 60 lb — 187; своя смесь 1:2:4 — 18 мешков цемента по 94 lb', () => {
    expect(concrete({ ...us, premixBag: convert(60, 'lb', 'kg') }).premixBags).toBe(187);
    const r = concrete(us);
    expect(r.bags).toBe(18);
    expect(convert(r.sand, 'm3', 'yd3')).toBeCloseTo(1.368888888, 6);
  });
});
