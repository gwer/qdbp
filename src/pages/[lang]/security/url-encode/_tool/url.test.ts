import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl } from './url';

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
