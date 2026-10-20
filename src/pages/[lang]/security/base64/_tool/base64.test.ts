import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64, encodeBase64Url } from './base64';

describe('base64', () => {
  it.each([
    ['', ''],
    ['hello', 'aGVsbG8='],
    ['Привет', '0J/RgNC40LLQtdGC'],
    ['qdbp.net 👍', 'cWRicC5uZXQg8J+RjQ=='],
  ])('%s ↔ %s', (text, b64) => {
    expect(encodeBase64(text)).toBe(b64);
    expect(decodeBase64(b64)).toBe(text);
  });

  it('URL-safe, без «=» и с переносами', () => {
    expect(decodeBase64('cWRicC5uZXQg8J-RjQ')).toBe('qdbp.net 👍');
    expect(decodeBase64('aGVs\nbG8')).toBe('hello');
  });

  it('мусор — ошибка', () => {
    expect(() => decodeBase64('не base64')).toThrow();
    expect(() => decodeBase64('/w==')).toThrow(); // байт 0xFF — не UTF-8
  });
});

describe('URL-safe', () => {
  it('«-» и «_» вместо «+» и «/», без «=»; декодируется обратно', () => {
    // «>>?» → «Pj4/», «ü» → «w7w=»
    expect(encodeBase64Url('>>?')).toBe('Pj4_');
    expect(encodeBase64Url('ü')).toBe('w7w');
    expect(decodeBase64(encodeBase64Url('Привет, мир! ~~~'))).toBe('Привет, мир! ~~~');
  });
});
