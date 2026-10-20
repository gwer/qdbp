import { describe, expect, it } from 'vitest';
import { errorOffset, formatJson, lineColumn, minifyJson } from './json';

describe('json', () => {
  it('форматирование и минификация', () => {
    expect(formatJson('{"b":1,"a":[1,2]}', 2)).toBe('{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}');
    expect(formatJson('{"a":1}', '\t')).toBe('{\n\t"a": 1\n}');
    expect(minifyJson('{ "a" : [ 1 , 2 ] }')).toBe('{"a":[1,2]}');
  });

  it('сортировка ключей вглубь', () => {
    expect(formatJson('{"b":{"d":1,"c":2},"a":0}', 2, true)).toBe('{\n  "a": 0,\n  "b": {\n    "c": 2,\n    "d": 1\n  }\n}');
  });

  it('кириллица и юникод не экранируются', () => {
    expect(minifyJson('{"имя":"Ёжик 👍"}')).toBe('{"имя":"Ёжик 👍"}');
  });

  it.each([
    ['{\n  "a": 1,\n  "b": }', 3, 8],
    ['{"a":1,}', 1, 8],
    ['[1,2', 1, 5],
    ["{'a':1}", 1, 2],
    ['{"a":01}', 1, 7],
    ['{"a":1} x', 1, 9],
    ['', 1, 1],
  ])('ошибка в %j → строка %d, столбец %d', (input, line, column) => {
    const off = errorOffset(input);
    expect(off).not.toBeNull();
    expect(lineColumn(input, off!)).toEqual({ line, column });
    expect(() => JSON.parse(input)).toThrow();
  });

  it.each(['{}', '[]', '{"a":[1,-2.5e3,true,false,null,"x\\n\\u00e9"]}', ' 42 '])('корректный %j — ошибки нет', (input) => {
    expect(errorOffset(input)).toBeNull();
    expect(() => JSON.parse(input)).not.toThrow();
  });
});

describe('repairJson', () => {
  it('комментарии, висячие запятые, одинарные кавычки, ключи без кавычек, True/None', async () => {
    const { repairJson } = await import('./json');
    const src = `{
      // настройки
      name: 'qdbp', /* старое: "x" */
      "tags": ['a', "it's", 'say "hi"',],
      ok: True, nothing: None,
      url: "http://x.org//path",
    }`;
    expect(JSON.parse(repairJson(src))).toEqual({ name: 'qdbp', tags: ['a', "it's", 'say "hi"'], ok: true, nothing: null, url: 'http://x.org//path' });
  });

  it('строгий JSON не меняется по смыслу', async () => {
    const { repairJson } = await import('./json');
    const s = '{"a":[1,2,{"b":null}],"c":"d\\"e"}';
    expect(JSON.parse(repairJson(s))).toEqual(JSON.parse(s));
  });

  it('безнадёжное — ошибка парсинга', async () => {
    const { repairJson } = await import('./json');
    expect(() => JSON.parse(repairJson('{a: [1, 2'))).toThrow();
  });
});
