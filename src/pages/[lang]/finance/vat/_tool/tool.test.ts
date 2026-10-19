import { describe, expect, it } from 'vitest';
import { vat } from './tool';

describe('vat', () => {
  it('начислить', () => {
    expect(vat(100000, 22, 'add')).toEqual({ vat: 22000, net: 100000, gross: 122000 });
    expect(vat(250, 20, 'add')).toEqual({ vat: 50, net: 250, gross: 300 });
  });

  it('выделить', () => {
    const r = vat(122000, 22, 'remove');
    expect(r.net).toBeCloseTo(100000, 9);
    expect(r.vat).toBeCloseTo(22000, 9);
    expect(vat(119, 19, 'remove').net).toBeCloseTo(100, 9);
    expect(vat(1230, 23, 'remove').vat).toBeCloseTo(230, 9);
  });

  it('выделить ≠ просто умножить на ставку', () => {
    expect(vat(120, 20, 'remove').vat).toBeCloseTo(20, 9);
    expect(vat(120, 20, 'remove').vat).not.toBeCloseTo(24, 3);
  });

});
