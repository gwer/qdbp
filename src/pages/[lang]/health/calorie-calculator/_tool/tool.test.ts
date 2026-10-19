import { describe, expect, it } from 'vitest';
import { bmr, def } from './tool';

describe('Mifflin–St Jeor', () => {
  it('эталоны', () => {
    expect(bmr('male', 30, 80, 180)).toBe(1780);
    expect(bmr('female', 30, 60, 165)).toBeCloseTo(1320.25, 6);
  });

  it('норма с активностью', () => {
    const r = def.compute({ sex: 'male', age: 30, weight: 80, height: 180, activity: 'moderate' });
    expect(r.tdee).toBeCloseTo(2759, 6);
    expect(r.loss).toBeCloseTo(2345.15, 6);
    expect(r.gain).toBeCloseTo(3172.85, 6);
  });
});
