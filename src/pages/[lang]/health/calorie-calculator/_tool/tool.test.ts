import { describe, expect, it } from 'vitest';
import { goals } from './Goals';
import { bmr, def } from './tool';

describe('Mifflin–St Jeor', () => {
  it('эталоны', () => {
    expect(bmr('male', 30, 80, 180)).toBe(1780);
    expect(bmr('female', 30, 60, 165)).toBeCloseTo(1320.25, 6);
  });

  it('норма с активностью', () => {
    const r = def.compute({ sex: 'male', age: 30, weight: 80, height: 180, activity: 'moderate' });
    expect(r.tdee).toBeCloseTo(2759, 6);
  });

  it('темпы: −0,5 кг в неделю = −550 ккал в день, −1 lb = −500', () => {
    expect(goals(2759, false).map((g) => Math.round(g.kcal))).toEqual([1659, 2209, 2484, 2759, 3034, 3309]);
    expect(goals(2759, true).find((g) => g.rate === -1)!.kcal).toBeCloseTo(2259, 6);
  });
});
