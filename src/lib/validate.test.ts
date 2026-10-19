import { describe, expect, it } from 'vitest';
import { defineCalculator } from '@/ui/define';
import { flattenKeys, requiredToolKeys, validateFiles } from './validate';

const calc = defineCalculator({
  inputs: { a: { type: 'number', default: 1 }, k: { type: 'select', options: ['x', 'y'], default: 'x' } },
  compute: ({ a }) => ({ r: a }),
  outputs: { r: {} },
});

const full = {
  title: 'T',
  description: 'D',
  inputs: { a: { label: 'A' }, k: { label: 'K', options: { x: 'X', y: 'Y' } } },
  outputs: { r: { label: 'R' } },
};

describe('validate', () => {
  it('flattenKeys', () => {
    expect(flattenKeys({ a: 'x', b: { c: 'y' } })).toEqual(['a', 'b.c']);
  });

  it('формы множественного числа — один ключ', () => {
    expect(flattenKeys({ n: { one: '1', few: '2', other: '3' } })).toEqual(['n']);
  });

  it('обязательные ключи калькулятора', () => {
    expect(requiredToolKeys(calc)).toEqual([
      'title', 'description', 'inputs.a.label', 'inputs.k.label', 'inputs.k.options.x', 'inputs.k.options.y', 'outputs.r.label',
    ]);
  });

  it('корректный набор файлов', () => {
    expect(validateFiles('t', { i18n: { ru: full, en: full }, content: ['ru', 'en'] }, requiredToolKeys(calc))).toEqual([]);
  });

  it('json без md и md без json', () => {
    const errors = validateFiles('t', { i18n: { ru: full, en: full }, content: ['ru', 'de'] }, []);
    expect(errors.join('\n')).toMatch(/i18n\/en\.json, но нет content\/en\.md/);
    expect(errors.join('\n')).toMatch(/content\/de\.md, но нет i18n\/de\.json/);
  });

  it('неизвестный код языка', () => {
    const errors = validateFiles('t', { i18n: { 'pt-br': full }, content: ['pt-br'] }, []);
    expect(errors.join('\n')).toMatch(/неизвестный код языка "pt-br"/);
  });

  it('нет ни одного языка', () => {
    expect(validateFiles('t', { i18n: {}, content: [] }, [])).toEqual(['t: нет ни одного языка']);
  });

  it('недостающие обязательные ключи', () => {
    const errors = validateFiles('t', { i18n: { ru: { title: 'T' } }, content: ['ru'] }, requiredToolKeys(calc));
    expect(errors[0]).toMatch(/нет ключей description, inputs\.a\.label/);
  });

  it('разные наборы ключей в языках', () => {
    const en = { ...full, ui: { extra: 'E' } };
    const errors = validateFiles('t', { i18n: { ru: full, en }, content: ['ru', 'en'] }, []);
    expect(errors[0]).toMatch(/в en лишние: ui\.extra/);
  });
});
