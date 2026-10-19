import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { bmi, bmiCategory, def } from './tool';

describe('bmi', () => {
  it('70 кг, 175 см', () => {
    const r = bmi(70, 175);
    expect(r.bmi).toBeCloseTo(22.857142857, 6);
    expect(r.category).toBe('normal');
    expect(r.healthyMin).toBeCloseTo(56.65625, 6);
    expect(r.healthyMax).toBeCloseTo(76.25625, 6);
  });

  it('160 lb, 69 in (через метрику) ≈ 703·lb/in²', () => {
    expect(bmi(160 * 0.45359237, 69 * 2.54).bmi).toBeCloseTo(23.6276, 3);
  });

  it.each([
    [18.44, 'under'],
    [18.46, 'normal'],
    [24.96, 'over'],
    [29.9, 'over'],
    [30, 'obese1'],
    [39.94, 'obese2'],
    [41, 'obese3'],
  ] as const)('категория %d → %s', (v, c) => {
    expect(bmiCategory(v)).toBe(c);
  });

  it('названия категорий есть во всех языках', () => {
    for (const [lang, dict] of Object.entries({ ru, en, es, de, pt })) {
      const t = makeT(lang as 'ru', dict);
      const spec = def.outputs.category;
      if (spec?.type !== 'custom') throw new Error('category должен быть custom');
      for (const c of ['under', 'normal', 'over', 'obese1', 'obese2', 'obese3'] as const) {
        expect(spec.format(c, { t, lang: lang as 'ru', units: 'metric', clock: '24' })).toMatch(/\S/);
      }
    }
  });
});
