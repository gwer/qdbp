import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { def, dueDate, pregnancyStart } from './tool';

describe('dueDate (правило Негеле)', () => {
  it('цикл 28 дней', () => {
    expect(dueDate('2026-03-01', 28, '2026-05-10')).toEqual({
      due: '2026-12-06',
      age: 70,
      trimester: 1,
      left: 210,
      conception: '2026-03-15',
    });
  });

  it('цикл 32 дня — дата родов позже на 4 дня, срок меньше', () => {
    expect(dueDate('2026-03-01', 32, '2026-05-10')).toMatchObject({ due: '2026-12-10', age: 66, conception: '2026-03-19' });
  });

  it('триместры по границам 14 и 28 недель', () => {
    expect(dueDate('2026-01-01', 28, '2026-04-08').trimester).toBe(1); // 97 дней = 13 нед. 6 дн.
    expect(dueDate('2026-01-01', 28, '2026-04-09').trimester).toBe(2); // 98 дней = 14 нед.
  });

  it('дата раньше начала — ошибка', () => {
    expect(() => dueDate('2026-03-01', 28, '2026-02-01')).toThrow('beforeStart');
  });

  it('по зачатию и переносу эмбриона: зачатие + 266, перенос 5 сут. + 261, 3 сут. + 263', () => {
    const due = (start: string) => dueDate(start, 28, start).due;
    expect(due(pregnancyStart('conception', '', 28, '2026-03-15', ''))).toBe('2026-12-06');
    expect(due(pregnancyStart('ivf5', '', 28, '', '2026-03-20'))).toBe('2026-12-06'); // 20.03 + 261
    expect(due(pregnancyStart('ivf3', '', 28, '', '2026-03-18'))).toBe('2026-12-06'); // 18.03 + 263
    expect(pregnancyStart('lmp', '2026-03-01', 32, '', '')).toBe('2026-03-05');
  });

  it('строки срока есть на всех языках', () => {
    const spec = def.outputs.age;
    if (spec?.type !== 'custom') throw new Error('age должен быть custom');
    for (const [lang, dict] of Object.entries({ ru, en, es, de, pt })) {
      const ctx = { t: makeT(lang as 'ru', dict), lang: lang as 'ru', units: 'metric' as const, clock: '24' as const };
      expect(spec.format(70, ctx)).toMatch(/10/);
      expect(spec.format(66, ctx)).toMatch(/9.*3/);
    }
  });
});
