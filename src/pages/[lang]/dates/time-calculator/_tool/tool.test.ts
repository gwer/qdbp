import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { dayShift, shiftTime } from './tool';

describe('shiftTime', () => {
  it('через полночь вперёд', () => {
    expect(shiftTime('2026-10-19', 22 * 60 + 30, 1, 0, 3, 0)).toEqual({ time: 90, date: '2026-10-20', shift: 1 });
  });

  it('назад через полночь', () => {
    expect(shiftTime('2026-10-20', 60, -1, 0, 2, 30)).toEqual({ time: 22 * 60 + 30, date: '2026-10-19', shift: -1 });
  });

  it('тот же день', () => {
    expect(shiftTime('2026-10-19', 14 * 60 + 10, 1, 0, 5, 20)).toEqual({ time: 19 * 60 + 30, date: '2026-10-19', shift: 0 });
  });

  it('дни + часы + минуты, через границу месяца', () => {
    expect(shiftTime('2026-10-30', 21 * 60, 1, 2, 12, 15)).toEqual({ time: 9 * 60 + 15, date: '2026-11-02', shift: 3 });
  });

  it('интервальное голодание 16:8', () => {
    expect(shiftTime('2026-10-19', 20 * 60, 1, 0, 16, 0)).toMatchObject({ time: 12 * 60, shift: 1 });
  });
});

describe('dayShift: строки есть во всех языках', () => {
  it.each(Object.entries({ ru, en, es, de, pt }))('%s', (lang, dict) => {
    const t = makeT(lang as 'ru', dict);
    for (const n of [-5, -2, -1, 0, 1, 2, 5, 21]) expect(dayShift(n, t)).toMatch(/\S/);
  });

  it('русская плюрализация', () => {
    const t = makeT('ru', ru);
    expect(dayShift(2, t)).toBe('Через 2 дня');
    expect(dayShift(5, t)).toBe('Через 5 дней');
    expect(dayShift(-21, t)).toBe('21 день назад');
  });
});
