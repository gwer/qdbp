import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl, encodeFullUrl } from './url';

describe('url', () => {
  it('кодирование', () => {
    expect(encodeUrl('a b&c=d/ё')).toBe('a%20b%26c%3Dd%2F%D1%91');
  });

  it('декодирование, «+» — пробел', () => {
    expect(decodeUrl('a%20b%26c%3Dd%2F%D1%91')).toBe('a b&c=d/ё');
    expect(decodeUrl('q=hello+world')).toBe('q=hello world');
  });

  it('битая последовательность — ошибка', () => {
    expect(() => decodeUrl('%E0%A4%A')).toThrow();
  });
});

describe('ссылка целиком', () => {
  it('служебные символы остаются, кириллица и пробелы кодируются', () => {
    expect(encodeFullUrl('https://ru.wikipedia.org/wiki/Кошка?q=a b&x=1#Раздел')).toBe(
      'https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D1%88%D0%BA%D0%B0?q=a%20b&x=1#%D0%A0%D0%B0%D0%B7%D0%B4%D0%B5%D0%BB',
    );
  });
});
