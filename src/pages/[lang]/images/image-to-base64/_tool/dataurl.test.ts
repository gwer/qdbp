import { describe, expect, it } from 'vitest';
import { bytesToBase64, formatOutput, parseDataUrl, sniffMime } from './dataurl';

// PNG 1×1 (прозрачный пиксель) — эталон из Python: base64.b64encode(open(...).read())
const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==';

describe('sniffMime', () => {
  it('по сигнатуре', () => {
    expect(sniffMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBe('image/png');
    expect(sniffMime(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffMime(Uint8Array.from([...'RIFF\0\0\0\0WEBP'].map((c) => c.charCodeAt(0))))).toBe('image/webp');
    expect(sniffMime(Uint8Array.from([...'GIF89a'].map((c) => c.charCodeAt(0))))).toBe('image/gif');
    expect(sniffMime(Uint8Array.from([1, 2, 3]))).toBeUndefined();
  });
});

describe('parseDataUrl', () => {
  it('data URL и голый Base64 с переносами', () => {
    expect(parseDataUrl(`data:image/png;base64,${PNG_1X1}`).mime).toBe('image/png');
    const { mime, bytes } = parseDataUrl(PNG_1X1.slice(0, 40) + '\n' + PNG_1X1.slice(40));
    expect(mime).toBe('image/png');
    expect(bytes.length).toBe(70);
    expect(bytesToBase64(bytes)).toBe(PNG_1X1);
  });

  it('формат определяется по содержимому, а не по заголовку', () => {
    expect(parseDataUrl(`data:image/jpeg;base64,${PNG_1X1}`).mime).toBe('image/png');
  });

  it('не картинка или не Base64 — ошибка', () => {
    expect(() => parseDataUrl('data:text/plain;base64,aGVsbG8=')).toThrow();
    expect(() => parseDataUrl('не base64')).toThrow();
    expect(() => parseDataUrl('')).toThrow();
  });
});

describe('formatOutput', () => {
  const url = 'data:image/png;base64,AAAA';
  it('варианты', () => {
    expect(formatOutput(url, 'base64')).toBe('AAAA');
    expect(formatOutput(url, 'css')).toBe('background-image: url("data:image/png;base64,AAAA");');
    expect(formatOutput(url, 'html', 'logo "1"')).toBe('<img src="data:image/png;base64,AAAA" alt="logo &quot;1&quot;">');
  });
});
