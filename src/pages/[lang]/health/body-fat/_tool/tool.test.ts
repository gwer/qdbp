import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { bodyFat, def, fatCategory } from './tool';

describe('bodyFat', () => {
  it('мужчина 178 см, шея 38, талия 86', () => {
    const r = bodyFat('male', 80, 178, 38, 86, 0);
    expect(r.percent).toBeCloseTo(17.204, 3);
    expect(r.category).toBe('fitness');
    expect(r.fat + r.lean).toBeCloseTo(80, 9);
  });

  it('женщина 165 см, шея 33, талия 72, бёдра 98', () => {
    const r = bodyFat('female', 60, 165, 33, 72, 98);
    expect(r.percent).toBeCloseTo(26.917, 3);
    expect(r.category).toBe('average');
  });

  it('совпадает с формулой для дюймов (±0,1%)', () => {
    const r = bodyFat('male', 80, 70 * 2.54, 15 * 2.54, 34 * 2.54, 0);
    expect(Math.abs(r.percent - (86.01 * Math.log10(19) - 70.041 * Math.log10(70) + 36.76))).toBeLessThan(0.1);
  });

  it('талия не больше шеи — ошибка', () => {
    expect(() => bodyFat('male', 80, 178, 40, 40, 0)).toThrow(RangeError);
  });

  it.each([
    ['male', 5.9, 'essential'],
    ['male', 6, 'athletes'],
    ['male', 24.9, 'average'],
    ['female', 31.9, 'average'],
    ['female', 32, 'obese'],
  ] as const)('%s %d%% → %s', (sex, p, c) => expect(fatCategory(sex, p)).toBe(c));

  it('названия категорий есть во всех языках', () => {
    const spec = def.outputs.category;
    if (spec?.type !== 'custom') throw new Error('category должен быть custom');
    for (const [lang, dict] of Object.entries({ ru, en, es, de, pt })) {
      const t = makeT(lang as 'ru', dict);
      for (const c of ['essential', 'athletes', 'fitness', 'average', 'obese'] as const) {
        expect(spec.format(c, { t, lang: lang as 'ru', units: 'metric', clock: '24' })).toMatch(/\S/);
      }
    }
  });
});
