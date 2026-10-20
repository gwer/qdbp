import { describe, expect, it } from 'vitest';
import { yeast } from './yeast';

describe('yeast', () => {
  it('25 г свежих', () => {
    const r = yeast(25, 'fresh');
    expect(r.active).toBeCloseTo(10, 6);
    expect(r.instant).toBeCloseTo(8.3333, 4);
  });

  it('7 г инстантных', () => {
    const r = yeast(7, 'instant');
    expect(r.fresh).toBeCloseTo(21, 6);
    expect(r.active).toBeCloseTo(8.4, 6);
  });

  it('42 г свежих (кубик)', () => {
    expect(yeast(42, 'fresh').instant).toBeCloseTo(14, 6);
  });
});
