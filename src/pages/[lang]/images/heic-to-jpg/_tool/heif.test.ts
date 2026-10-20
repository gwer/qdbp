import { describe, expect, it } from 'vitest';
import { ftypBrands, isHeif } from './heif';

// Начала файлов: ftyp и начало следующего бокса.
const hex = (s: string) => Uint8Array.from(s.split(/\s+/).filter(Boolean).map((x) => parseInt(x, 16)));

// Как у iPhone: major heic, совместимые mif1 MiHE miaf MiHB heic.
const IPHONE = hex('00 00 00 24 66 74 79 70 68 65 69 63 00 00 00 00 6d 69 66 31 4d 69 48 45 6d 69 61 66 4d 69 48 42 68 65 69 63 00 00 0a 2b 6d 65 74 61');
// Пример из репозитория libheif: major mif1, совместимые mif1 heic hevc.
const LIBHEIF = hex('00 00 00 1c 66 74 79 70 6d 69 66 31 00 00 00 00 6d 69 66 31 68 65 69 63 68 65 76 63 00 00 03 99 6d 65 74 61');
// AVIF (libavif): major avif, совместимые avif mif1 miaf MA1B.
const AVIF = hex('00 00 00 20 66 74 79 70 61 76 69 66 00 00 00 00 61 76 69 66 6d 69 66 31 6d 69 61 66 4d 41 31 42 00 00 01 0d 6d 65 74 61');
// Видео MP4: ftyp isom.
const MP4 = hex('00 00 00 20 66 74 79 70 69 73 6f 6d 00 00 02 00 69 73 6f 6d 69 73 6f 32 61 76 63 31 6d 70 34 31');
const JPEG = hex('ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00');

describe('ftypBrands', () => {
  it('reads major and compatible brands', () => {
    expect(ftypBrands(LIBHEIF)).toEqual(['mif1', 'mif1', 'heic', 'hevc']);
    expect(ftypBrands(IPHONE)).toEqual(['heic', 'mif1', 'MiHE', 'miaf', 'MiHB', 'heic']);
  });
  it('returns null for non-BMFF data', () => {
    expect(ftypBrands(JPEG)).toBeNull();
    expect(ftypBrands(new Uint8Array(4))).toBeNull();
  });
  it('does not read past a truncated header', () => {
    expect(ftypBrands(IPHONE.slice(0, 24))).toEqual(['heic', 'mif1', 'MiHE']);
  });
});

describe('isHeif', () => {
  it('accepts HEIC from iPhone and libheif', () => {
    expect(isHeif(IPHONE)).toBe(true);
    expect(isHeif(LIBHEIF)).toBe(true);
  });
  it('rejects AVIF, MP4 and JPEG', () => {
    expect(isHeif(AVIF)).toBe(false);
    expect(isHeif(MP4)).toBe(false);
    expect(isHeif(JPEG)).toBe(false);
  });
});
