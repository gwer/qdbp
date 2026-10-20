import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { def, waterIntake } from './tool';

describe('waterIntake', () => {
  it('70 кг без тренировок — 2,1 л', () => expect(waterIntake(70, 0, false).total).toBeCloseTo(2.1, 9));
  it('70 кг, час тренировок, жара', () => expect(waterIntake(70, 60, true).total).toBeCloseTo(3.3, 9));

  it('стаканы и чашки во всех языках', () => {
    const spec = def.outputs.glasses;
    if (spec?.type !== 'custom') throw new Error('glasses должен быть custom');
    for (const [lang, dict] of Object.entries({ ru, en, es, de, pt })) {
      const t = makeT(lang as 'ru', dict);
      expect(spec.format(2.1, { t, lang: lang as 'ru', units: 'metric', clock: '24' })).toMatch(/8/);
      expect(spec.format(2.1, { t, lang: lang as 'ru', units: 'imperial', clock: '24' })).toMatch(/9/);
    }
  });
});
