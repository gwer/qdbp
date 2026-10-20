import { describe, expect, it } from 'vitest';
import { idealWeight } from './tool';

describe('idealWeight', () => {
  it('мужчина 5 футов 10 дюймов (177,8 см)', () => {
    const r = idealWeight('male', 177.8);
    expect(r.devine).toBeCloseTo(73, 6);
    expect(r.robinson).toBeCloseTo(71, 6);
    expect(r.miller).toBeCloseTo(70.3, 6);
    expect(r.hamwi).toBeCloseTo(75, 6);
  });

  it('женщина 5 футов 5 дюймов (165,1 см)', () => {
    const r = idealWeight('female', 165.1);
    expect(r.devine).toBeCloseTo(57, 6);
    expect(r.robinson).toBeCloseTo(57.5, 6);
    expect(r.miller).toBeCloseTo(59.9, 6);
    expect(r.hamwi).toBeCloseTo(56.5, 6);
  });

  it('диапазон по ИМТ', () => {
    const r = idealWeight('male', 180);
    expect(r.bmiMin).toBeCloseTo(59.94, 6);
    expect(r.bmiMax).toBeCloseTo(80.676, 6);
  });
});
