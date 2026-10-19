import { describe, expect, it } from 'vitest';
import { makeT } from './t';

describe('makeT', () => {
  const ru = makeT('ru', {
    a: { b: 'Привет, {name}!' },
    n: { one: '{count} файл', few: '{count} файла', many: '{count} файлов', other: '{count} файла' },
  });

  it('вложенные ключи и интерполяция', () => {
    expect(ru('a.b', { name: 'мир' })).toBe('Привет, мир!');
  });

  it('плюрализация по правилам языка', () => {
    expect(ru('n', { count: 1 })).toBe('1 файл');
    expect(ru('n', { count: 3 })).toBe('3 файла');
    expect(ru('n', { count: 5 })).toBe('5 файлов');
    expect(ru('n', { count: 21 })).toBe('21 файл');
    expect(ru('n', { count: 1.5 })).toBe('1.5 файла');
  });

  it('словари просматриваются по порядку', () => {
    const t = makeT('en', { x: 'tool' }, { x: 'ui', y: 'ui' });
    expect(t('x')).toBe('tool');
    expect(t('y')).toBe('ui');
  });

  it('отсутствующий ключ — исключение', () => {
    expect(() => ru('missing.key')).toThrow(/missing\.key/);
  });
});
