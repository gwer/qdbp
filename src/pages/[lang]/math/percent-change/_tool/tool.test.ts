import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { direction, percentChange } from './tool';

describe('percentChange', () => {
  it('рост', () => {
    expect(percentChange(80, 100)).toEqual({ change: 25, direction: 1, difference: 20, ratio: 1.25 });
  });

  it('снижение', () => {
    expect(percentChange(100, 80)).toEqual({ change: -20, direction: -1, difference: -20, ratio: 0.8 });
  });

  it('несимметричность: +50% и −50% не возвращают к исходному', () => {
    expect(percentChange(100, 150).change).toBe(50);
    expect(percentChange(150, 75).change).toBe(-50);
  });

  it('без изменений и от нуля', () => {
    expect(percentChange(42, 42)).toMatchObject({ change: 0, direction: 0 });
    expect(() => percentChange(0, 10)).toThrow();
  });
});

describe('direction: строки есть во всех языках', () => {
  it.each(Object.entries({ ru, en, es, de, pt }))('%s', (lang, dict) => {
    const t = makeT(lang as 'ru', dict);
    for (const s of [-1, 0, 1]) expect(direction(s, t)).toMatch(/\S/);
  });
});
