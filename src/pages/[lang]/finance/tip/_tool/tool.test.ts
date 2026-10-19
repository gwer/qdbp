import { describe, expect, it } from 'vitest';
import { expectAllKeys } from '../../_shared/testing';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { base, tip } from './tool';

describe('tip', () => {
  it('счёт 86,40, 18%, трое', () => {
    const r = tip(86.4, 18, 3);
    expect(r.tip).toBeCloseTo(15.552, 9);
    expect(r.total).toBeCloseTo(101.952, 9);
    expect(r.perPerson).toBeCloseTo(33.984, 9);
  });

  it('один человек, без чаевых', () => {
    expect(tip(50, 0, 1)).toEqual({ tip: 0, total: 50, perPerson: 50, tipPerPerson: 0 });
  });

  it('ноль человек — ошибка', () => {
    expect(() => tip(50, 10, 0)).toThrow();
  });

  it('подписи есть на всех языках', () => {
    expectAllKeys(base, { ru, en, es, de, pt });
  });
});
